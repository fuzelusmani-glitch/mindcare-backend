import express from "express";
import { getGeminiResponse } from "../services/geminiService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body; // ✅ matches frontend format

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // Extract the last user message to send to Gemini
    const lastUserMessage = messages
      .filter((m) => m.role === "user")
      .pop()?.content || "";

    // Build conversation history for context
    const history = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const reply = await getGeminiResponse(lastUserMessage, history);

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
