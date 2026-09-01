import { getServerGeminiClient } from "@/lib/gemini-server";
import { requireApiSession } from "@/lib/apiAuth";
import { parseSubsidyExplanationRequest } from "@/lib/requestValidation";
import { enforceRateLimit } from "@/lib/rateLimit";
import { enforceBodyLimit, enforceSameOrigin, withTimeout } from "@/lib/requestGuards";

export async function POST(req: Request) {
  const originError = enforceSameOrigin(req);
  if (originError) return originError;
  const bodyLimitError = enforceBodyLimit(req, 128 * 1024);
  if (bodyLimitError) return bodyLimitError;
  const authError = await requireApiSession();
  if (authError) return authError;
  const rateLimitError = enforceRateLimit(req, "gemini-subsidy", 20, 60 * 1000);
  if (rateLimitError) return rateLimitError;

  let requestData: ReturnType<typeof parseSubsidyExplanationRequest>;
  try {
    requestData = parseSubsidyExplanationRequest(await req.json());
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
        { text: "Unable to generate subsidy explanation right now." },
        { status: 500 }
      );
    }

const {
  location,
  monthlyBill,
  systemSizeKW,
  paybackYears,
  centralSubsidy,
  stateSubsidy,
  totalSubsidy,
  netSystemCost,
  subsidyCoverage
} = requestData;
const prompt = `
You are an expert solar financial advisor for Indian households.

User configuration:
Location: ${location}
System size: ${systemSizeKW} kW
Monthly electricity bill: ${monthlyBill === null ? "Not provided" : `₹${monthlyBill}`}

Financial results from Zenith engine:
Central subsidy: ₹${centralSubsidy}
State subsidy: ₹${stateSubsidy}
Total subsidy: ₹${totalSubsidy}
Net system cost: ₹${netSystemCost}
Subsidy coverage: ${subsidyCoverage}%
Estimated payback: ${paybackYears} years

Task:
Explain the solar investment quality.

Instructions:
1. First classify investment as GOOD, MODERATE, or POOR.
2. Explain why the payback period occurs.
3. Explain the role of subsidies in reducing cost.
4. Mention one realistic limitation.
5. Mention what happens after payback.

Style:
Clear and professional.
Maximum 5 sentences.
No markdown or symbols.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await withTimeout(model.generateContent(prompt), 20_000);
    const text = result.response.text();

    return Response.json({ text });

  } catch (error) {
    console.error("❌ Gemini subsidy error:", error);

    return Response.json(
      { text: "Unable to generate subsidy explanation right now." },
      { status: 500 }
    );
  }
}
