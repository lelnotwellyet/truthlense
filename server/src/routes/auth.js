import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase.js';
import env from '../config/env.js';
import authenticate from '../middleware/auth.js';
import { validateSignup, validateLogin } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authLimiter, validateSignup, async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
        emailRedirectTo: `${env.FRONTEND_URL}/login`,
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`User signed up (verification pending): ${email}`);
    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is banned or suspended
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_banned, is_suspended')
      .eq('id', data.user.id)
      .single();

    if (profile?.is_banned) {
      return res.status(403).json({ error: 'Your account has been banned' });
    }
    if (profile?.is_suspended) {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    logger.info(`User logged in: ${email}`);
    res.json({ user: data.user, session: data.session });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authenticate, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const { data, error } = await req.supabase.auth.updateUser({ password });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password updated successfully', user: data.user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, user_preferences(*)')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

export default router;
