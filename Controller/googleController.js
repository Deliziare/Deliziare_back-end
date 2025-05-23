import asyncHandler from '../utils/asyncHandler.js';
import User from '../Models/userModel.js';
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { sendTokensAsCookies } from '../utils/tokenHandler.js';



export const googleLogin = asyncHandler(async (req, res) => {
  try {
    console.log('Starting Google login process...');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const body = req.body;

    if (!body?.credential) {
      throw new AppError('No Google credentials provided!', 400);
    }

    console.log('Verifying Google token...');
    const ticket = await client.verifyIdToken({
      idToken: body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    console.log('Google payload received:', { email, name });

    let user = await User.findOne({ email });
    console.log('User lookup result:', user);

    if (!user) {
      console.log('Creating new user for Google login...');
      const newUserData = {
        name,
        email,
        role: 'host',
        profilePic: picture,
        isBlock: false,
        isGoogleUser: true
      };
      console.log('User data to create:', newUserData);
      
      user = await User.create(newUserData);
     
      console.log('User created successfully:', user);
    } else if (user.isBlock) {
      console.log('Blocked user attempt:', email);
      return res.status(403).json({
        status: false,
        message: 'User is blocked. Contact support.',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    sendTokensAsCookies(res,accessToken,refreshToken)

    console.log('Login successful for user:', user.email);
    res.status(200).json({
      status: true,
      message: 'Successfully logged in',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        isGoogleUser: user.isGoogleUser
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      status: false,
      message: 'Error occurred during Google login',
      errorMessage: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});