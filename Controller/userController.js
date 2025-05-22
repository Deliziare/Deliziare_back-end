import asyncHandler from '../utils/asyncHandler.js';
import { isEmailRegistered} from '../Service/userService.js';
import jwt from 'jsonwebtoken';
import { sendOtpService ,verifyOtpService,forgotPasswordService,resetPasswordService,verifyPasswordOtpService,resendOtpService} from '../Service/userService.js';
import User from '../Models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { sendTokensAsCookies } from '../utils/tokenHandler.js';



export const sendOtpController = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const { email, role, ...userData } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role required' });
    }

    await sendOtpService(email, role, userData);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error('Error in sendOtpController:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
  

export const verifyOtpController = asyncHandler(async (req, res) => {
  try {
    const result = await verifyOtpService(req);

    if (!result.success) {
      return res.status(result.status || 400).json({ message: result.message });
    }

    res.status(200).json({ message: 'OTP verified and user registered successfully.' });
  } catch (error) {
    console.error('Error in verifyOtpController:', error);
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
  sendTokensAsCookies(res,accessToken,refreshToken)

   
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



  export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw new CustomError("Refresh token missing", 401);
  
    const { newAccessToken } = await refreshAccessTokenService(refreshToken);
  
    const isProd = process.env.NODE_ENV === 'production';
  
    res
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 15 * 60 * 1000,
      path:'/'
    })
    .status(200)
    .json({
      status: STATUS.SUCCESS,
      message: "Access token refreshed",
      
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



export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const result = await forgotPasswordService(email);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  res.status(200).json({ message: result.message });
});


export const verifyPasswordOtpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const result = verifyPasswordOtpService(email, otp);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  res.status(200).json({ message: 'OTP verified', tempToken: result.tempToken });
});




export const resetPasswordController = asyncHandler(async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const result = await resetPasswordService(token, newPassword);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ 
      message: 'Password reset successfully',
      user: result.user
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});  


export const resendOtpController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const result = await resendOtpService(email);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in resendOtpController:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
