import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import API routes
import apiRouter from './routes/api';

// Load environment variables
dotenv.config({ path: '../.env' });
dotenv.config();

// Startup check for JWT_SECRET in production mode
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('CRITICAL FATAL ERROR: JWT_SECRET environment variable must be set in production mode.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to be loaded cross-origin
  })
);

// Strict CORS Configuration (FRONTEND_URL & CLIENT_ORIGIN)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_ORIGIN,
  'https://my-portfolio-client-nine.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
]
  .filter(Boolean)
  .map((o) => (o as string).trim().replace(/\/$/, '')) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or listed origins
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      const isAllowed = allowedOrigins.some(
        (o) => normalizedOrigin === o || normalizedOrigin.startsWith(o)
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use((req: any, res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie || '';
  req.cookies = cookieHeader.split(';').reduce((acc: any, curr: string) => {
    const [key, value] = curr.split('=').map((c) => c.trim());
    if (key) acc[key] = value;
    return acc;
  }, {});
  next();
});

// Serve uploaded static files with CSP sandbox security headers for SVG assets
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../public/uploads'), {
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.svg')) {
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
    },
  })
);

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    database: 'Supabase PostgreSQL',
    supabase: {
      projectId: process.env.SUPABASE_PROJECT_ID || 'txmbbpvkmmzjgyjiefgh',
      url: process.env.SUPABASE_URL || 'https://txmbbpvkmmzjgyjiefgh.supabase.co',
      configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY),
    },
  });
});

// Strict Rate Limiting for Login Attempts (5 attempts per 15 minutes per IP)
const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});
app.use('/api/auth/login', authLoginLimiter);

// General Rate limiting for public API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Mount API router
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (Supabase Backend)`);
});

export default app;
