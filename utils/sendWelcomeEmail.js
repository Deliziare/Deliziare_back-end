import nodemailer from 'nodemailer';

const sendWelcomeEmail = async ({ to, name }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #fff8f0; padding: 20px; border-radius: 10px; color: #333;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #f0e6dd; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden;">
        <div style="background-color: #f27c38; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px;">Welcome to Deliziare!</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            We're thrilled to have you join <strong>Deliziare</strong> — your trusted destination for culinary connection.
            Whether you're here to host, cook, or deliver, you're now part of a community passionate about great food and smooth experiences.
          </p>
          <p style="font-size: 16px; margin-bottom: 30px;">
            If you ever need help or have questions, don’t hesitate to reach out. Let’s make something delicious together.
          </p>
          <p style="font-size: 16px;">Warm regards,<br><strong>— Team Deliziare</strong></p>
        </div>
        <div style="background-color: #f9f1eb; padding: 15px; text-align: center; font-size: 14px; color: #777;">
          © ${new Date().getFullYear()} Deliziare. All rights reserved.
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Deliziare Team" <${process.env.EMAIL}>`,
    to,
    subject: 'Welcome to Deliziare!',
    html
  });
};

export default sendWelcomeEmail;
