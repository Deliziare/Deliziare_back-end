import asyncHandler from '../utils/asyncHandler.js';
import { registerChef, registerDeliveryBoy, registerHost } from '../Service/userService.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

import { generateOTP } from '../utils/otp.js';
import { saveOTP,verifyAndConsumeOTP } from '../utils/otpStore.js';
import sendOTPEmail from '../utils/sendMail.js';

export const chefRegister = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400);
    throw new Error('Certificate file is required');
  }

  const result = await uploadToCloudinary(file.buffer);

  const data = await registerChef({
    ...req.body,
    certificate: result.secure_url,
  });

  res.status(201).json({ message: 'Chef registered successfully', data });
});

export const deliveryBoyRegister = asyncHandler(async (req, res) => {
  const { license, IDProof } = req.files;
  if (!license || !IDProof) {
    res.status(400);
    throw new Error('License and ID Proof are required');
  }

  const licenseUrl = await uploadToCloudinary(license[0].buffer);
  const IDProofUrl = await uploadToCloudinary(IDProof[0].buffer);

  const data = await registerDeliveryBoy({
    ...req.body,
    license: licenseUrl.secure_url,
    IDProof: IDProofUrl.secure_url,
  });

  res.status(201).json({ message: 'Delivery boy registered successfully', data });
});

export const hostRegister = asyncHandler(async (req, res) => {
  const data = await registerHost(req.body);
  res.status(201).json({ message: 'Host registered successfully', data });
});





export const sendOtp = async (req, res) => {
    const { email, role, ...userData } = req.body;
    if (!email || !role) return res.status(400).json({ message: 'Email and role required' });
  
    const otp = generateOTP();
  
    saveOTP(email, otp, { role, ...userData });
  
    await sendOTPEmail({
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`
    });
  
    res.json({ message: "OTP sent successfully" });
  };
  
  export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const { valid, userData, reason } = verifyAndConsumeOTP(email, otp);
  
    if (!valid) return res.status(400).json({ message: reason });
  
    res.status(200).json({ message: "OTP verified", userData });
  };