import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import { validateBookmark } from '../utils/validators.js';

const router = Router();

// GET /api/bookmarks
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data: bookmarks, error } = await supabaseAdmin
      .from('bookmarks')
      .select('*, articles(*), verification_reports(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ bookmarks: bookmarks || [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookmarks
router.post('/', authenticate, validateBookmark, async (req, res, next) => {
  try {
    const { type, article_id, report_id } = req.body;

    const bookmark = {
      user_id: req.user.id,
      type,
      article_id: type === 'article' ? article_id : null,
      report_id: type === 'report' ? report_id : null,
    };

    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .insert(bookmark)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ bookmark: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('bookmarks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
