import nodemailer from "nodemailer";

export const sendMail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
