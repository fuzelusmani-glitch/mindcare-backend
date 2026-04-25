import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ FIX 1: Specific CORS origin (replace with your actual Vercel URL)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://mindcare-frontend-puce.vercel.app'  // ← PUT YOUR VERCEL URL HERE
  ],
  credentials: true
}));

app.use(express.json());

// ✅ FIX 2: Rate limiter was 15 SECONDS — changed to 15 MINUTES
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api", limiter);
app.use("/api", authRoutes);
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("MindCare API Running...");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.8,
    });
    const reply = response.choices?.[0]?.message?.content ?? "Sorry, no response";
    return res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "OpenAI request failed" });
  }
});