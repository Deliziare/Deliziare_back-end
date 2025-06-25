const otpTemplate = (otp) => `
  <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fffaf4; border: 1px solid #ffd9b3; border-radius: 8px; padding: 30px;">
    <div style="text-align: center;">
      <h2 style="color: #ff7f00; margin-bottom: 10px;">🔐 Verify Your Email</h2>
      <p style="font-size: 16px; color: #333;">Use the OTP below to complete your registration:</p>
      <div style="margin: 20px 0;">
        <span style="font-size: 28px; font-weight: bold; background-color: #fff3e0; padding: 12px 24px; border-radius: 6px; letter-spacing: 3px; display: inline-block; color: #d35400;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #555;">This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ffd9b3;" />
    <div style="text-align: center; font-size: 12px; color: #999;">
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} MeetSync</p>
    </div>
  </div>
`;

export default otpTemplate;
