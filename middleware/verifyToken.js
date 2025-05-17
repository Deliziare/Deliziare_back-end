
import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ message: 'Access Denied. No token.' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
     
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};
