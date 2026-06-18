import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';

const router = Router();

// GET /api/sources — public list
router.get('/', async (req, res, next) => {
  try {
    const { data: sources, error } = await supabaseAdmin
      .from('sources')
      .select('*')
      .order('credibility_score', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ sources: sources || [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/sources — admin add source
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, domain, credibility_score, category, description } = req.body;

    const { data, error } = await supabaseAdmin
      .from('sources')
      .insert({ name, domain, credibility_score: credibility_score || 50, category, description })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ source: data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sources/:id — admin update
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { credibility_score, category, description, is_verified } = req.body;
    const updates = {};
    if (credibility_score !== undefined) updates.credibility_score = credibility_score;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (is_verified !== undefined) updates.is_verified = is_verified;

    const { data, error } = await supabaseAdmin
      .from('sources')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ source: data });
  } catch (err) {
    next(err);
  }
});

export default router;
