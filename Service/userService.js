
import User from '../Models/userModel.js';
import { generateOTP } from '../utils/otp.js';
import { saveOTP } from '../utils/otpStore.js';
import sendOTPEmail from '../utils/sendMail.js';
import otpTemplate from '../utils/emailTemplate/otpTemplate.js'
import Chef from '../Models/chefModel.js';
import DeliveryBoy from '../Models/deliveryboyModel.js';
import { verifyAndConsumeOTP } from '../utils/otpStore.js';
import bcrypt from 'bcryptjs';
import { markOTPVerified } from '../utils/otpStore.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import jwt from 'jsonwebtoken';
import { generateAccessToken, verifyTokens } from '../utils/generateToken.js';
import CustomError from '../utils/CustomError.js';


export const sendOtpService = async (email, role, userData) => {
  const otp = generateOTP();
  console.log('Generated OTP:', otp);

  
  const otpData = { 
    role, 
    ...userData,
    location: userData.location || { lat: 0, lng: 0 }
  };

  saveOTP(email, otp, otpData);

  await sendOTPEmail({
    to: email,
    subject: "Your OTP Code",
    html: otpTemplate(otp),
  });
};

export const verifyOtpService = async (req) => {
  const { email, otp } = req.body;

  const { valid, reason, userData } = (() => {
    const result = verifyAndConsumeOTP(email, otp);
    if (!result.valid) return { valid: false, reason: result.reason, userData: null };
    return { valid: true, reason: null, userData: result.userData };
  })();

  if (!valid) {
    return { success: false, message: reason };
  }

  const name = req.body.name || userData?.name;
  const password = req.body.password || userData?.password;
  const phone = req.body.phone || userData?.phone;
  const role = req.body.role || (userData ? userData.role : 'host');

  if (!name || !password || !phone) {
    return { success: false, message: 'Missing registration fields' };
  }


  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return { success: false, status: 409, message: 'User already registered with this email' };
  }


  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, phone, password: hashedPassword, role });
  await newUser.save();


  
  if (role === 'chef') {
    let certificateUrl = null;
    let specializations = req.body.specializations || userData?.specializations || [];

if (typeof specializations === 'string') {
  try {
    specializations = JSON.parse(specializations);
  } catch (err) {
    specializations = [];
  }
}

    if (req.files?.certificate?.[0]) {
      const uploadResult = await uploadToCloudinary(req.files.certificate[0].buffer);
      certificateUrl = uploadResult.secure_url;
    }
    const location = req.body.location || 
                    (userData?.locationLat && userData?.locationLng 
                      ? { 
                          lat: parseFloat(userData.locationLat),
                          lng: parseFloat(userData.locationLng) 
                        }
                      : { lat: 0, lng: 0 });
    const chef = new Chef({
      userId: newUser._id,
      experience: req.body.experience || userData?.experience,
      specialize: specializations,
      location,
      certificate: certificateUrl,
    });
    await chef.save();
  }

  if (role === 'deliveryBoy') {
    let IDProofUrl = null;
    let licenseUrl = null;
     const location = req.body.location || 
                    (userData?.locationLat && userData?.locationLng 
                      ? { 
                          lat: parseFloat(userData.locationLat),
                          lng: parseFloat(userData.locationLng) 
                        }
                      : { lat: 0, lng: 0 });

    if (req.files?.IDProof?.[0]) {
      const uploadResult = await uploadToCloudinary(req.files.IDProof[0].buffer);
      IDProofUrl = uploadResult.secure_url;
    } else if (userData?.IDProof?.buffer) {
      const uploadResult = await uploadToCloudinary(userData.IDProof.buffer);
      IDProofUrl = uploadResult.secure_url;
    }

    if (req.files?.license?.[0]) {
      const uploadResult = await uploadToCloudinary(req.files.license[0].buffer);
      licenseUrl = uploadResult.secure_url;
    } else if (userData?.license?.buffer) {
      const uploadResult = await uploadToCloudinary(userData.license.buffer);
      licenseUrl = uploadResult.secure_url;
    }

    const deliveryBoy = new DeliveryBoy({
      userId: newUser._id,
      location,
      vehicleType: req.body.vehicleType || userData?.vehicleType,
      IDProof: IDProofUrl,
      license: licenseUrl,
    });

    await deliveryBoy.save();
  }

  markOTPVerified(email);

  return { success: true, user: newUser };

};



export const isEmailRegistered = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const existingUser = await User.findOne({ email });
  return !!existingUser;
};


export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new CustomError("Refresh token missing", 401);
  }

  let decoded;
  try {
    decoded = verifyTokens(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new CustomError("Invalid or expired refresh token", 403);
  }

  if (!decoded) {
    throw new CustomError("Invalid or expired refresh token", 403);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const newAccessToken = generateAccessToken(user);
  return { newAccessToken };
};


export const forgotPasswordService = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { 
        success: true, 
        message: 'If an account exists with this email, a reset OTP has been sent'
      };
    }

    const otp = generateOTP();
    saveOTP(email, otp, { id: user._id });

    await sendOTPEmail({
      to: email,
      subject: "Password Reset OTP",
      html: otpTemplate(otp, 'password reset')
    });

    return { success: true, message: 'OTP sent to email' };
  } catch (error) {
    console.error('Forgot password service error:', error);
    return { success: false, message: 'Failed to process password reset' };
  }
};


export const verifyPasswordOtpService = (email, otp) => {
  const result = verifyAndConsumeOTP(email, otp);
  if (!result.valid) {
    return { success: false, message: result.reason };
  }

  const tempToken = jwt.sign({ id: result.userData.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '10m',
  });

  return { success: true, tempToken };
};



export const resetPasswordService = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await sendOTPEmail({
      to: user.email,
      subject: "Password Changed Successfully",
      html: `<p>Your password has been successfully updated.</p>`
    });

    return { 
      success: true,
      message: 'Password reset successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Reset password service error:', error);
    if (error.name === 'TokenExpiredError') {
      return { success: false, message: 'Token expired. Please request a new OTP.' };
    }
    return { success: false, message: 'Failed to reset password' };
  }
};


export const resendOtpService = async (email) => {
 
  const otp = generateOTP();
  console.log('Resent OTP:', otp);
  
  console.log('Email to send OTP:', email); 
  
  saveOTP(email, otp);

 
  await sendOTPEmail({
    to: email,
    subject: "Your OTP Code (Resent)",
    html: otpTemplate(otp),
  });

  return { success: true, message: 'OTP resent successfully' };
};


export const findUserById=async(id)=>{
  try {
    return await User.findById(id)
  } catch (error) {
    console.log(error)
  }
}