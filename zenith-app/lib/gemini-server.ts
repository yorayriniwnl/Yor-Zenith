import { GoogleGenerativeAI } from "@google/generative-ai";

export function getServerGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenerativeAI(apiKey);
}
