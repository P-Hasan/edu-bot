import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API key. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent("Explain how AI works in a few words");
  console.log(result.response.text());
}

main();
