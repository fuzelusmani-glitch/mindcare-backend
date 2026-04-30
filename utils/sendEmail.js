import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  },
  });

  const mailOptions = {
    from:"fuzelusmani@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: 'Your OTP is ${otp}',
  };

  await transporter.sendMail(mailOptions);
};