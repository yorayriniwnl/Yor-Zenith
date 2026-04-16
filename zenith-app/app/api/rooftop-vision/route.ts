import { getServerGeminiClient } from "@/lib/gemini-server";

export async function POST(req: Request) {
  try {
    const genAI = getServerGeminiClient();

    if (!genAI) {
      return Response.json({ text: "{}" }, { status: 500 });
    }

    const { image } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
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
    ]);

    const response = await result.response;
    const text = response.text();

    return Response.json({ text });

  } catch (error) {
    console.error("🔥 Rooftop vision error:", error);

    return Response.json({ text: "{}" }, { status: 500 });
  }
}
