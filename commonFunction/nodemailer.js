const nodemailer = require('nodemailer');
require('dotenv').config()
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const sendEMail = async (to, subject, text) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color:#333;">${subject}</h2>
        <p>${text}</p>
        <div style="margin-top: 10px; padding: 10px; background-color: #f2f2f2; border-radius: 6px; display: inline-block;">
          <strong style="font-size: 18px; color: #4CAF50;">${text.match(/\d{4,6}/) || ""}</strong>
        </div>
        <br/>
        <p style="font-size: 14px; color: #888;">— Smart AI Assistant 🤖</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Smart AI Assistant" <ranusharma14112003@gmail.com>',
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}:`, info.messageId);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
  }
};

module.exports = { sendEMail };
