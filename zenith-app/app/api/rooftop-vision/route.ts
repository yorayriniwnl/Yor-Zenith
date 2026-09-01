import { getServerGeminiClient } from "@/lib/gemini-server";
import { requireApiSession } from "@/lib/apiAuth";
import {
  parseRooftopVisionRequest,
  parseRooftopVisionResult,
  parseStructuredJson,
} from "@/lib/requestValidation";
import { enforceRateLimit } from "@/lib/rateLimit";
import { enforceBodyLimit, enforceSameOrigin, withTimeout } from "@/lib/requestGuards";

export async function POST(req: Request) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;
  const bodyLimitError = enforceBodyLimit(req, 10 * 1024 * 1024);
  if (bodyLimitError) return bodyLimitError;
  const authError = await requireApiSession();
  if (authError) return authError;
  const rateLimitError = enforceRateLimit(req, "rooftop-vision", 5, 60 * 1000);
  if (rateLimitError) return rateLimitError;

  let requestData: ReturnType<typeof parseRooftopVisionRequest>;
  try {
    requestData = parseRooftopVisionRequest(await req.json());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const genAI = getServerGeminiClient();

    if (!genAI) {
      return Response.json({ text: "{}" }, { status: 500 });
    }

    const { image, mimeType } = requestData;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await withTimeout(model.generateContent([
      {
        inlineData: {
          mimeType,
          data: image,
        },
      },
      `
Analyze this rooftop image for solar installation.

Return ONLY JSON:

{
 "roofAreaSqFt": number,
 "recommendedKW": number,
 "obstacles": ["object1","object2"]
}
`,
    ]), 30_000);

    const response = await result.response;
    const parsed = parseRooftopVisionResult(parseStructuredJson(response.text()));

    return Response.json({ analysis: parsed, text: JSON.stringify(parsed) });

  } catch (error) {
    console.error("🔥 Rooftop vision error:", error);

    return Response.json({ error: "Rooftop analysis failed" }, { status: 502 });
  }
}
