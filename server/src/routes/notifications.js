import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import authenticate from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ notifications: notifications || [] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ notification: data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

export default router;
