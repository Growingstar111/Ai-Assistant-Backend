const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

const sendEMail = (Email, Subject, Text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: Email,
    subject: Subject,
    text: Text,
    // html: "<b>Hello world?</b>", // HTML body
  };
  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent: ' + info.response);
    })
    .catch(error => {
      console.error('Error sending email: ', error);
    });
};
module.exports = { sendEMail };