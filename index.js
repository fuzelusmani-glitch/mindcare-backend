import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Specific CORS — no trailing slash!
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mindcare-frontend-puce.vercel.app",
  ],
  credentials: true,
}));

app.use(express.json());

// ✅ Rate limiter — 15 MINUTES
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api", limiter);
app.use("/api", authRoutes);
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("MindCare API Running ✅");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
