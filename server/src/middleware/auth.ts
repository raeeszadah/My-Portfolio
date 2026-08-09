import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabaseServer } from '../config/supabase';

dotenv.config({ path: '../.env' });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const getAuthorizedEmails = (): string[] => {
  const envEmails = process.env.AUTHORIZED_EMAILS || 'admin@tecoritham.com,owner@tecoritham.com,mearaees@gmail.com';
  return envEmails.split(',').map((e) => e.trim().toLowerCase());
};

/**
 * Middleware to authenticate and authorize administrator requests via Supabase Auth & session tokens.
 */
export const authenticateJWT = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No session token provided.' });
    }

    const authorizedList = getAuthorizedEmails();

    // 1. Verify via Supabase Auth API
    try {
      const { data: supabaseUser, error: supabaseError } = await supabaseServer.auth.getUser(token);
      if (supabaseUser?.user && !supabaseError) {
        const userEmail = (supabaseUser.user.email || '').toLowerCase();
        if (!authorizedList.includes(userEmail)) {
          return res.status(403).json({ error: 'Access Denied: Account is not authorized for administrator access.' });
        }

        req.user = {
          id: supabaseUser.user.id,
          email: supabaseUser.user.email,
          role: supabaseUser.user.role || 'authenticated',
          supabaseAuth: true,
        };
        return next();
      }
    } catch {
      // Fallthrough to token payload check if network call fails
    }

    // 2. Decode fallback token payload
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.email) {
        if (!authorizedList.includes(decoded.email.toLowerCase())) {
          return res.status(403).json({ error: 'Access Denied: Account is not authorized.' });
        }
        req.user = decoded;
        return next();
      }
    } catch {
      // Return 401 on verification failure
    }

    return res.status(401).json({ error: 'Access denied. Invalid or expired session token.' });
  } catch (err) {
    return res.status(401).json({ error: 'Access denied. Expired or corrupt session.' });
  }
};
