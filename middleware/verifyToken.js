import User from '../Models/userModel.js';
import { verifyTokens } from '../utils/generateToken.js';


export const verifyToken = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Access Denied. No token.' });

  try {
    const decoded = verifyTokens(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("-password"); 
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

