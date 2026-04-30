import express from "express";
import { getChatResponse } from "../services/groqService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const reply = await getChatResponse(messages);
    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
