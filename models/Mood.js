import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
  userEmail: String,
  mood: Number,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Mood", moodSchema);