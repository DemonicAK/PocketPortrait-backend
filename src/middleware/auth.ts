import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import User from '../models/User';

// interface AuthRequest extends Request {
//   user?: any;
// }
import { AuthRequest } from '../types';

// interface JwtPayload {
//   userId: string;
//   email: string;
// }


export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // console.log('🍪 All cookies:', req.cookies); // Debug log
  // console.log('🔑 Auth token cookie:', req.cookies?.authToken); // Debug log
  
  // Check if cookies exist
  if (!req.cookies) {
    // console.log('❌ No cookies found');
    res.status(401).json({ message: 'No cookies found' });
    return;
  }

  const token = req.cookies.authToken;
  // console.log('🎫 Extracted token:', token ? 'Token exists' : 'No token'); // Debug log
  
  if (!token) {
    // console.log('❌ No auth token in cookies');
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  // Check if token is a valid string
  if (typeof token !== 'string' || token.trim() === '') {
    // console.log('❌ Invalid token format:', typeof token, token);
    res.status(401).json({ message: 'Invalid token format' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    // console.log('✅ Token verified successfully');
    req.user = decoded;
    next();
  } catch (error) {
    // console.log('❌ Token verification failed:', error);
    res.status(403).json({ message: 'Invalid token' });
  }
};;