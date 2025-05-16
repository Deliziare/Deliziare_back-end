import asyncHandler from '../utils/asyncHandler.js';
import { isEmailRegistered, registerChef, registerDeliveryBoy, registerHost } from '../Service/userService.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/otp.js';
import { saveOTP,verifyAndConsumeOTP,markOTPVerified } from '../utils/otpStore.js';
import sendOTPEmail from '../utils/sendMail.js';

import { isOTPVerified } from '../utils/otpStore.js';
import User from '../Models/userModel.js';
import bcrypt from 'bcryptjs';
import otpTemplate from '../utils/emailTemplate/otpTemplate.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

export const chefRegister = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!isOTPVerified(email)) {
    res.status(403);
    throw new Error('OTP verification required before registration');
  }

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
    const { email } = req.body;
    if (!isOTPVerified(email)) {
      res.status(403);
      throw new Error('OTP verification required before registration');
    }
  
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
    const { email } = req.body;
  
    if (!isOTPVerified(email)) {
      res.status(403);
      throw new Error('OTP verification required before registration');
    }
  
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
      html: otpTemplate(otp)
    });
  
    res.json({ message: "OTP sent successfully" });
  };
  



  export const verifyOtp = asyncHandler(async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      const { valid, reason, userData } = (() => {
        const result = verifyAndConsumeOTP(email, otp);
        if (!result.valid) return { valid: false, reason: result.reason, userData: null };
        return { valid: true, reason: null, userData: result.userData };
      })();
  
      if (!valid) return res.status(400).json({ message: reason });
  
      const name = req.body.name || userData?.name;
      const password = req.body.password || userData?.password;
      const phone = req.body.phone || userData?.phone;
      const role = req.body.role || userData?.role || 'host';
  
      if (!name || !password || !phone) {
        return res.status(400).json({ message: 'Missing registration fields' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User already registered with this email' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      });
  
      await newUser.save();
  
      markOTPVerified(email);
  
      res.status(200).json({ message: 'OTP verified and user registered successfully.' });
    } catch (error) {
      console.error('Error in verifyOtp:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
   
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  
   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
   const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

   
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      
    });
  });


  export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});
  export const getCurrentUser = asyncHandler(async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    return res.status(403).json({ message: 'Token invalid or expired' });
  }
});


  
  export const checkEmailExists = async (req, res) => {
  const { email } = req.body;

  try {
    const exists = await isEmailRegistered(email);

    if (exists) {
      return res.status(200).json({ exists: true, message: 'Email already in use' });
    }

    return res.status(200).json({ exists: false, message: 'Email is available' });
  } catch (error) {
    console.error('Error checking email:', error.message);
    return res.status(400).json({ error: error.message || 'Invalid request' });
  }

};

