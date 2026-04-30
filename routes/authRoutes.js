import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

const router = express.Router();

// 🔹 Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // check OTP first
    const record = await
    Otp.findOne({ email });
    

    if (!record) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    // check expiry
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // compare hashed OTP
    const isOtpValid = await bcrypt.compare(otp, record.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // delete OTP after success
    await Otp.deleteMany({ email });

    res.status(201).json({
      message: "Signup successful",
      user: { name: user.name, email: user.email },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//login route
router.post("/login", async (req, res) => { try {

const { email, password } = req.body;

const user = await User.findOne({ email });

if (!user) {

res.status(400).json({ message: "Invalid email or password" }); }

const isMatch = await bcrypt.compare(password, user.password); if (!isMatch) {

res.status(400).json({ message: "Invalid email or password"});

}

res.status(200).json({

message: "Login successful", user: {name: user.name, email: user.email},

});

} catch (error) {

res.status(500).json({message:

error.message });

}

});
// otp routes
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // basic validation
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // delete old OTPs
    await Otp.deleteMany({ email });

    // hash OTP before saving
const hashedOtp = await bcrypt.hash(otp, 10);

// save new OTP
await Otp.create({
  email,
  otp: hashedOtp,
  expiresAt: new Date(Date.now() + 5 * 60 * 1000),
});

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // delete OTP after success
    await Otp.deleteMany({ email });

    res.json({ success: true, message: "OTP verified" });

  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});
export default router;