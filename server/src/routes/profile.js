import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /api/profile
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Profile not found' });

    const { data: preferences } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    res.json({ profile, preferences });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile
router.put('/', authenticate, async (req, res, next) => {
  try {
    const { full_name, bio, avatar_url } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile/preferences
router.put('/preferences', authenticate, async (req, res, next) => {
  try {
    const { topics } = req.body;
    if (!Array.isArray(topics)) {
      return res.status(400).json({ error: 'Topics must be an array' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert({ user_id: req.user.id, topics }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ preferences: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/profile/history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { data: reports, error } = await supabaseAdmin
      .from('verification_reports')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ reports: reports || [] });
  } catch (err) {
    next(err);
  }
});

export default router;
