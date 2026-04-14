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
 
const allowedOrigins = [
  "https://localhost:5173",
  "https://mindcare-frontend-six.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
 
app.use(express.json());
app.use("/api",authRoutes);
app.get("/",(req, res)=>{
  res.send("MindCare API Running...");

});
const PORT = process.env.PORT || 4000;
app.listen(PORT,()=>
  console.log(`Server running on http://localhost:${PORT}`)
);




app.post("/api/signup", async (req, res) => {
  try {
    console.log("Signup API HIT");
    console.log(req.body);
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User saved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//login api//


app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Email:",email);
    console.log("Body:",req.body);

    

    const user = await User.findOne({ email });
    console.log("User found:",user);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🔥 CREATE TOKEN
    const token = jwt.sign(
      { userId: user._id },
      "secret123",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// basic rate limiter (tweak for production)
const limiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 10,             // max 10 requests per window per IP
});
app.use("/api/", limiter);

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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));

