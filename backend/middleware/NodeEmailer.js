
/**
 * ================================================================================
 * ⛔ COPYRIGHT NOTICE
 * --------------------------------------------------------------------------------
 * © Zero IT Solutions – All Rights Reserved
 * 
 * ⚠️ Unauthorized copying, distribution, or reproduction of this file, 
 *     via any medium, is strictly prohibited.
 * 
 * 🔒 This file contains proprietary and confidential information. Dissemination 
 *     or use of this material is forbidden unless prior written permission is 
 *     obtained from Zero IT Solutions.
 * --------------------------------------------------------------------------------
 * 🧑‍💻 Author       : Sangeeta Kumari <sangeeta.zeroit@gmail.com>
 * 📅 Created On    : Dec 2025
 * 📝 Description   : OTP email sender using Nodemailer (Gmail App Password)
 * ================================================================================
 */
import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  try {
    // Create transporter with Gmail and App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SENDER_EMAIL,       // your Gmail address
        pass: process.env.SENDER_PASSWORD,    // your Gmail App Password
      },
    });

    // Email content
    const mailOptions = {
      from: `"Kpigi App" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your OTP for Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #e91e63;">Kpigi App</h2>
          <p>Your One-Time Password (OTP) for password reset is:</p>
          <h3 style="background:#f4f4f4; padding:10px; display:inline-block;">${otp}</h3>
          <p>This code will expire in <b>5 minutes</b>.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    return false;
  }
};
