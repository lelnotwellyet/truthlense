import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * Admin middleware — checks that the authenticated user has ADMIN role.
 * Must be used after the authenticate middleware.
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Profile not found' });
    }

    if (profile.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userRole = 'ADMIN';
    next();
  } catch (err) {
    logger.error('Admin middleware error:', err);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

export default requireAdmin;
