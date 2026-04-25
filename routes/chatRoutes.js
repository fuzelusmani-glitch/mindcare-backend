import express from "express";
import { getGeminiResponse } from "../services/geminiService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const reply = await getGeminiResponse(message);

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;