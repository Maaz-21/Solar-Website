import nodemailer from "nodemailer";

export async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SolarOwl" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
}
