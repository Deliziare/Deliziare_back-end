const otpTemplate = (otp) => `
  <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
    <div style="text-align: center;">
      <h2 style="color: #4A90E2; margin-bottom: 10px;">Verify Your Email</h2>
      <p style="font-size: 16px; color: #333;">Use the OTP below to complete your registration:</p>
      <div style="margin: 20px 0;">
        <span style="font-size: 28px; font-weight: bold; background-color: #f7f7f7; padding: 10px 20px; border-radius: 6px; letter-spacing: 2px; display: inline-block; color: #222;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
    </div>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    <div style="text-align: center; font-size: 12px; color: #999;">
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>&copy; ${new Date().getFullYear()} MeetSync</p>
    </div>
  </div>
`;

export default otpTemplate;
