const otpStore = new Map();

export const saveOTP = (email, otp, userData) => {
  console.log('Saving OTP:', otp, 'for', email);

  otpStore.set(email, {
    otp,
    userData,
    expiresAt: Date.now() + 5 * 60 * 1000, 
  });
};

export const verifyAndConsumeOTP = (email, inputOtp) => {
  console.log('Verifying OTP for', email, 'Input:', inputOtp, 'Stored:', otpStore.get(email));

  const record = otpStore.get(email);
  if (!record) return { valid: false, reason: 'No OTP found' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, reason: 'OTP expired' };
  }
  if (record.otp !== inputOtp) {
    return { valid: false, reason: 'Invalid OTP' };
  }

  const userData = record.userData;
  otpStore.delete(email);
  return { valid: true, userData };
};


export const getOtpData = (email) => {
  const record = otpStore.get(email);
  if (!record) return null;
  return { otp: record.otp, userData: record.userData };
};
