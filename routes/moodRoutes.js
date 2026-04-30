import express from "express";
import Mood from "../models/Mood.js";

const router = express.Router();

// Save mood
router.post("/", async (req, res) => {
  const { email, mood } = req.body;

  const newMood = await Mood.create({
    userEmail: email,
    mood
  });

  res.json(newMood);
});

// Get mood history
router.get("/:email", async (req, res) => {
  const moods = await Mood.find({ userEmail: req.params.email });
  res.json(moods);
});

export default router;