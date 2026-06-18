import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import { validateVote } from '../utils/validators.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /api/votes — upsert vote
router.post('/', authenticate, validateVote, async (req, res, next) => {
  try {
    const { report_id, vote_type } = req.body;

    // Upsert the vote
    const { data, error } = await supabaseAdmin
      .from('votes')
      .upsert(
        { user_id: req.user.id, report_id, vote_type },
        { onConflict: 'user_id,report_id' }
      )
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Auto-flag: check if negative votes > 60% of total
    const { data: allVotes } = await supabaseAdmin
      .from('votes')
      .select('vote_type')
      .eq('report_id', report_id);

    const total = (allVotes || []).length;
    const downvotes = (allVotes || []).filter(v => v.vote_type === 'down').length;

    if (total >= 5 && downvotes / total > 0.6) {
      await supabaseAdmin
        .from('verification_reports')
        .update({ is_public: false })
        .eq('id', report_id);
      logger.info(`Report ${report_id} auto-flagged: ${downvotes}/${total} negative votes`);
    }

    res.json({ vote: data, stats: { up: total - downvotes, down: downvotes, total } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/votes/:report_id — remove vote
router.delete('/:report_id', authenticate, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('votes')
      .delete()
      .eq('user_id', req.user.id)
      .eq('report_id', req.params.report_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Vote removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
