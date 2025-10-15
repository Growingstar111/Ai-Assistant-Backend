const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  // host: 'smtp.gmail.com',
  // port: 587,
  // secure: false,
  service:"gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 30000
});

const sendEMail = async (Email, Subject, Text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: Email,
    subject: Subject,
    text: Text,
    // html: "<b>Hello world?</b>", // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] Email sent successfully to ${Email}: ${info.response}`);
    return { success: true, info };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error sending email to ${Email}:`, error.message);
    throw error; 
  }
};

module.exports = { sendEMail };
