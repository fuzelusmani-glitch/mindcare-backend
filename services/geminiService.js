import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiResponse = async (message, history = "") => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `You are MindCare, a warm and empathetic mental health assistant. Be supportive, concise, and non-judgmental.

${history ? `Conversation so far:\n${history}\n` : ""}User: ${message}
Assistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
