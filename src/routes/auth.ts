import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, AuthResponse } from '../types';

const router = express.Router();

// Register
router.post('/register', async (req: Request<{}, AuthResponse, AuthRequest>, res: Response<AuthResponse>): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' } as any);
      return;
    }

    // Create user
    const user = new User({ email, username, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      } as jwt.SignOptions
    );
        // Set JWT in httpOnly cookie with proper settings
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Changed from 'strict' for better compatibility
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days to match JWT expiration
    });
    res.cookie('isLoggedIn', 'true', {
  httpOnly: false, // Middleware and JS can see this
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message } as any);
  }
});

// Login
router.post('/login', async (req: Request<{}, AuthResponse, AuthRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

 
  
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      } as jwt.SignOptions
    );
    // Set JWT in httpOnly cookie with proper settings
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax', // Changed from 'strict' for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match JWT expiration
      path: '/' // Ensure cookie is accessible across the app
    });
    res.cookie('isLoggedIn', 'true', {
  httpOnly: false, // Middleware and JS can see this
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' // Ensure cookie is cleared across the app
  });
res.clearCookie('isLoggedIn', {
    httpOnly: false, // Allow JS to clear this cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' // Ensure cookie is cleared across the app
  });
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as jwt.JwtPayload;
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;