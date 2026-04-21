const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log('Email sent: %s', info.messageId);
};

module.exports = { sendEmail };
