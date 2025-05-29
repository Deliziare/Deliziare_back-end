import jwt from 'jsonwebtoken';
import CustomError from './CustomError.js';


export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role,email:user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '50m' }
  );
};


export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role,email:user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};


export const verifyTokens = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new CustomError('Invalid or expired token', 403);
  }
};
