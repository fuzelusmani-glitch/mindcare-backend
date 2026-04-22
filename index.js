import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import OpenAI from "openai";
import User from "./models/User.js";
import connectDB from'./config/db.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import authRoutes from "./routes/authRoutes.js";
dotenv.config();
connectDB();

const app = express();
 

app.use(cors(
  {
  origin:true,
  credentials:true
  }));

app.use(express.json());

app.use("/api",authRoutes);
app.get("/",(req, res)=>{
  res.send("MindCare API Running...");

});
app.use("/api/", limiter);
const PORT = process.env.PORT || 4000;
app.listen(PORT,()=>
  console.log(`Server running on http://localhost:${PORT}`)
);





// basic rate limiter (tweak for production)
const limiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 10,             // max 10 requests per window per IP
});


// create OpenAI client (server-side only)
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// simple chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body; // expect [{ role: 'user'|'system'|'assistant', content: '...' }, ...]
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // Protect: limit conversation length (tokens) or length of messages here
    // Optional: run content moderation here before forwarding.

    // Call OpenAI Responses / Chat Completions
    // Example using Chat Completions-style call (replace model per your access)
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",      // choose model you have access to; docs list options.
      messages: messages,
      max_tokens: 500,
      temperature: 0.8,
    });

    // Extract text reply (SDK may return structure like response.choices[0].message.content)
    // Adjust according to SDK version (Responses API vs Chat Completions)
    const reply = response.choices?.[0]?.message?.content ?? response.output_text ?? "Sorry, no response";

    return res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "OpenAI request failed" });
  }
});

