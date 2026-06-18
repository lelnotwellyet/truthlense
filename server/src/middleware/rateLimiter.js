import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

// Much more generous limits in development
const isDev = env.NODE_ENV === 'development';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 20,
  message: { error: 'Verification rate limit reached, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
