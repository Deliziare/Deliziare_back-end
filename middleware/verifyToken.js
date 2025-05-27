
import jwt from 'jsonwebtoken';
import { verifyTokens } from '../utils/generateToken.js';


export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Access Denied. No token.' });

  try {

    const decoded = verifyTokens(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; 

    next();
  } catch (err) {
    //return res.status(403).json({ message: 'Invalid token.' });
    next(err)
  }
};
