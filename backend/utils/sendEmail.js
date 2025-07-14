const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "soualhiamariem@gmail.com",
        pass: "dtmrkjmgvatojsws", // ⚠️ Utilise un mot de passe d'application Gmail
      },
    });

    await transporter.sendMail({
      from: `"FleetPulse Notification" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

module.exports = sendEmail;
