import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config(); // ✅ load env here too

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getChatResponse = async (messages) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are MindCare, a warm and empathetic mental health assistant. Be supportive, concise, and non-judgmental.",
        },
        ...messages.filter((m) => m.role !== "system"),
      ],
      max_tokens: 500,
      temperature: 0.8,
    });
    return completion.choices[0]?.message?.content || "Sorry, I couldn't respond.";
  } catch (error) {
    console.error("Groq Error:", error);
    throw error;
  }
};