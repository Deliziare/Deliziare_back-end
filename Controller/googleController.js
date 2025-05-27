import asyncHandler from '../utils/asyncHandler.js';
import User from '../Models/userModel.js';
import Chef from '../Models/chefModel.js';
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import { sendTokensAsCookies } from '../utils/tokenHandler.js';
import DeliveryBoy from '../Models/deliveryboyModel.js';

export const googleLogin = asyncHandler(async (req, res) => {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { credential, role } = req.body;

    if (!credential) throw new AppError('No Google credentials provided!', 400);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    const userRole = ['host', 'chef', 'deliveryBoy'].includes(role) ? role : 'host';

    if (user && user.role !== userRole) {
      return res.status(400).json({
        status: false,
        message: `This email is already registered as a ${user.role}`,
      });
    }

    if (!user) {
      // Create user
      user = await User.create({
        name,
        email,
        role: userRole,
        profileImage: picture,
        isGoogleUser: true
      });

      // Create chef profile if role is chef
      if (userRole === 'chef') {
        await Chef.create({
          userId: user._id,
          phone:'Unknown',
          location: { lat: 0, lng: 0 }, // Default location
          district: 'Unknown', // Default district
          experience: 'Not specified' // Default experience
        });
      }

      if(userRole === 'deliveryBoy'){
        await DeliveryBoy.create({
          userId: user._id,
          phone:'Unknown',
          
        });
      }
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    sendTokensAsCookies(res, accessToken, refreshToken);

    res.status(200).json({
      status: true,
      message: 'Successfully logged in',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profileImage,
        isGoogleUser: user.isGoogleUser
      },
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      status: false,
      message: 'Error during Google login',
      error: error.message
    });
  }
});