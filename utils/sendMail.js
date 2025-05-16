import nodemailer from 'nodemailer';

const sendOTPEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html
  });
};




export default sendOTPEmail;
