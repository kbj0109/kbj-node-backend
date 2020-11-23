const nodemailer = require('nodemailer');

module.exports = async ({ to, subject, content }) => {
  if (process.env.MAIL_HOST === undefined) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html: content,
    });

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
