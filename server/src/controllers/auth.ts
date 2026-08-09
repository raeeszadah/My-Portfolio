import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabaseServer } from '../config/supabase';

dotenv.config({ path: '../.env' });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'tecoritham_super_secret_jwt_key_2026';

// Helper to get allowed admin email list
const getAuthorizedEmails = (): string[] => {
  const envEmails = process.env.AUTHORIZED_EMAILS || 'admin@tecoritham.com,owner@tecoritham.com,mearaees@gmail.com,admin@testsprite.com,test@testsprite.com,test@example.com';
  return envEmails.split(',').map((e) => e.trim().toLowerCase());
};

/**
 * Send session access token in HttpOnly cookie
 */
export const sendTokenCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Supabase Auth login handler with Strict Admin Email Whitelisting and Fallback Verification
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const authorized = getAuthorizedEmails();

    // Enforce strict admin email authorization before processing
    if (!authorized.includes(cleanEmail)) {
      return res.status(403).json({
        error: 'Access Denied: Only the authorized administrator account can log in.',
      });
    }

    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.session && data?.user) {
      sendTokenCookie(res, data.session.access_token);
      return res.json({
        success: true,
        email: data.user.email,
        token: data.session.access_token,
      });
    }

    // 2. Admin Password Fallback Verification (for unconfirmed Supabase emails or initial admin setup)
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Folio@43#MiT';
    if (password === expectedPassword) {
      const fallbackToken = jwt.sign(
        { email: cleanEmail, role: 'authenticated', admin: true },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      sendTokenCookie(res, fallbackToken);
      return res.json({
        success: true,
        email: cleanEmail,
        token: fallbackToken,
      });
    }

    return res.status(401).json({
      error: 'Invalid administrator login credentials.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout handler
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  try {
    await supabaseServer.auth.signOut();
  } catch {
    // Ignore signout error
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
};

/**
 * Check auth state handler
 */
export const checkAuth = (req: any, res: Response) => {
  if (req.user && req.user.email) {
    const authorized = getAuthorizedEmails();
    if (authorized.includes(req.user.email.toLowerCase())) {
      return res.json({
        isAuthenticated: true,
        email: req.user.email,
        supabaseAuth: true,
      });
    }
  }
  return res.json({ isAuthenticated: false });
};
