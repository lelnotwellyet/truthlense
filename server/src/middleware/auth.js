import { createClient } from '@supabase/supabase-js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Authentication middleware — verifies Bearer token via Supabase.
 * Attaches the authenticated user to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token' });
    }

    // Verify token with Supabase
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    req.supabase = supabase; // pass user-scoped client
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export default authenticate;
