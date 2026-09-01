import { getServerGeminiClient } from "@/lib/gemini-server";
import { requireApiSession } from "@/lib/apiAuth";
import { parseRooftopFinanceRequest } from "@/lib/requestValidation";
import { enforceRateLimit } from "@/lib/rateLimit";
import { enforceBodyLimit, enforceSameOrigin, withTimeout } from "@/lib/requestGuards";

export async function POST(req: Request) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;
  const bodyLimitError = enforceBodyLimit(req, 128 * 1024);
  if (bodyLimitError) return bodyLimitError;
  const authError = await requireApiSession();
  if (authError) return authError;
  const rateLimitError = enforceRateLimit(req, "rooftop-ai", 20, 60 * 1000);
  if (rateLimitError) return rateLimitError;

  let requestData: ReturnType<typeof parseRooftopFinanceRequest>;
  try {
    requestData = parseRooftopFinanceRequest(await req.json());
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
        { text: "AI analysis unavailable right now." },
        { status: 500 }
      );
    }

    const {
      siteName,
      systemSizeKW,
      batteryKWh,
      irr,
      paybackYears,
      equityRequired,
      npv
    } = requestData;

    const prompt = `
You are Zenith AI, a solar finance analyst.

Analyze this rooftop solar investment model and explain the result in simple business terms.

Project:
Site: ${siteName}
System Size: ${systemSizeKW} kW
Battery Storage: ${batteryKWh} kWh
IRR: ${irr} %
Payback Period: ${paybackYears} years
Equity Required: ₹${equityRequired}
Net Present Value: ₹${npv}

Explain:
1. Whether this project is financially attractive
2. Why the IRR is strong or weak
3. Any risk factors
4. One improvement suggestion

Keep response under 120 words.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await withTimeout(model.generateContent(prompt), 20_000);

    const response = await result.response;
const text = response.text();

    return Response.json({ text });

  } catch (error) {
    console.error("🔥 Rooftop AI error:", error);

    return Response.json(
      { text: "AI analysis unavailable right now." },
      { status: 500 }
    );
  }
}
