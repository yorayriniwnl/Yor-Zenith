import { getServerGeminiClient } from "@/lib/gemini-server";
import { requireApiSession } from "@/lib/apiAuth";
import { parseFeasibilityRequest } from "@/lib/requestValidation";
import { enforceRateLimit } from "@/lib/rateLimit";
import { enforceBodyLimit, enforceSameOrigin, withTimeout } from "@/lib/requestGuards";

export async function POST(req: Request) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;
  const bodyLimitError = enforceBodyLimit(req, 128 * 1024);
  if (bodyLimitError) return bodyLimitError;
  const authError = await requireApiSession();
  if (authError) return authError;
  const rateLimitError = enforceRateLimit(req, "gemini-explanation", 20, 60 * 1000);
  if (rateLimitError) return rateLimitError;

  let requestData: ReturnType<typeof parseFeasibilityRequest>;
  try {
    requestData = parseFeasibilityRequest(await req.json());
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const genAI = getServerGeminiClient();

    if (!genAI) {
      return Response.json(
        { text: "Unable to generate explanation at the moment." },
        { status: 500 }
      );
    }

    const { location, monthlyBill, systemSizeKW, paybackYears } = requestData;

    // ✅ THIS IS THE PROMPT (the brain of Gemini)
const prompt = `
You are a senior solar energy advisor for Indian households.

User data (already calculated, do NOT question it):
- Location: ${location}
- Monthly electricity bill: ₹${monthlyBill}
- Recommended solar system size: ${systemSizeKW} kW
- Estimated payback period: ${paybackYears} years

Your task:
Explain the solar feasibility clearly and honestly.

Rules:
- First, state whether this is a GOOD, MODERATE, or POOR solar investment.
- Then explain WHY the payback period is ${paybackYears} years.
- Mention what happens AFTER the payback period (savings, reduced bills).
- Include 1 realistic limitation or expectation (maintenance, weather, usage change).

Style rules:
- Use simple language for a non-technical user.
- Use short sentences or bullet points.
- Be practical and India-specific.
- No emojis.
- No marketing or hype.
- Do not invent numbers or schemes.

Formatting rules:
- Do NOT use markdown.
- Do NOT use ** or * characters.
- Do NOT bold or italicize text.
- Write labels as plain text only (GOOD, MODERATE, POOR).

Limit: 5–6 concise lines maximum.
`;


    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await withTimeout(model.generateContent(prompt), 20_000);
    const text = result.response.text();

    return Response.json({ text });
  } catch (error) {
    console.error("❌ Gemini error:", error);
    return Response.json(
      { text: "Unable to generate explanation at the moment." },
      { status: 500 }
    );
  }
}
