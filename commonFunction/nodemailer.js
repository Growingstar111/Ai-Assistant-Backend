const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEMail = async (to, subject, text) => {
  try {
    const response = await resend.emails.send({
      from:'Smart AI Assistant <onboarding@resend.dev>', 
      to:to,
      subject:subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color:#333;">${subject}</h2>
          <p>${text}</p>
          <div style="margin-top: 10px; padding: 10px; background-color: #f2f2f2; border-radius: 6px; display: inline-block;">
            <strong style="font-size: 18px; color: #4CAF50;">${text.match(/\d{4,6}/) || ""}</strong>
          </div>
          <br/>
          <p style="font-size: 14px; color: #888;">
            — Smart AI Assistant 🤖
          </p>
        </div>
      `,
    });

    console.log(`Email sent to ${to} (${subject})`);
    return response;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendEMail };
