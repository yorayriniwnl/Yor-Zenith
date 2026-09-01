import { getServerGeminiClient } from "@/lib/gemini-server";
import { requireApiSession } from "@/lib/apiAuth";
import { enforceRateLimit } from "@/lib/rateLimit";
import { enforceBodyLimit, enforceSameOrigin, withTimeout } from "@/lib/requestGuards";

export async function POST(req: Request) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;
  const bodyLimitError = enforceBodyLimit(req, 9 * 1024 * 1024);
  if (bodyLimitError) return bodyLimitError;
  const authError = await requireApiSession();
  if (authError) return authError;
  const rateLimitError = enforceRateLimit(req, "bill-parser", 5, 60 * 1000);
  if (rateLimitError) return rateLimitError;

  try {
    const genAI = getServerGeminiClient();

    if (!genAI) {
      return Response.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // 1️⃣ Read uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!(file instanceof File) || !supportedTypes.has(file.type)) {
      return Response.json(
        { error: "Upload a JPEG, PNG, or WebP bill image" },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > 8 * 1024 * 1024) {
      return Response.json({ error: "Bill image must be smaller than 8 MB" }, { status: 413 });
    }

    // 2️⃣ Convert file → base64 (Gemini requirement)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3️⃣ Load Gemini Vision model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // 4️⃣ Strict prompt (VERY important)
    const prompt = `
You are reading an Indian electricity bill.

Extract ONLY the final monthly payable amount in INR.

Rules:
- Output ONLY a number.
- No symbols, no commas, no words.
- If unsure, output null instead of guessing.
`;

    // 5️⃣ Send image + prompt to Gemini
    const result = await withTimeout(model.generateContent([
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type,
        },
      },
      { text: prompt },
    ]), 30_000);

    // 6️⃣ Clean Gemini response
    const text = result.response.text().trim();
    const amount = Number(text.replace(/[₹,\s]/g, ""));

    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
      return Response.json(
        { error: "Unable to extract bill amount" },
        { status: 422 }
      );
    }

    // 7️⃣ Return result to frontend
    return Response.json({ monthlyBill: amount });

  } catch (error) {
    console.error("Bill parser error:", error);
    return Response.json(
      { error: "Bill parsing failed" },
      { status: 500 }
    );
  }
}
