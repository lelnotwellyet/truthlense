import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /api/admin/users
router.get('/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({ users: users || [], total: count || 0, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { is_banned, is_suspended, role } = req.body;
    const updates = {};
    if (is_banned !== undefined) updates.is_banned = is_banned;
    if (is_suspended !== undefined) updates.is_suspended = is_suspended;
    if (role !== undefined) updates.role = role;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Log admin action
    await supabaseAdmin.from('admin_actions').insert({
      admin_id: req.user.id,
      action_type: 'update_user',
      target_type: 'user',
      target_id: req.params.id,
      details: updates,
    });

    logger.info(`Admin ${req.user.id} updated user ${req.params.id}: ${JSON.stringify(updates)}`);
    res.json({ user: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/articles
router.get('/articles', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: articles, error, count } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ articles: articles || [], total: count || 0, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });

    await supabaseAdmin.from('admin_actions').insert({
      admin_id: req.user.id,
      action_type: 'delete_article',
      target_type: 'article',
      target_id: req.params.id,
    });

    res.json({ message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/analytics
router.get('/analytics', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const [users, articles, reports, flagged, votes, sources] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('verification_reports').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('verification_reports').select('id', { count: 'exact', head: true }).eq('is_public', false),
      supabaseAdmin.from('votes').select('vote_type'),
      supabaseAdmin.from('sources').select('name, credibility_score').order('credibility_score', { ascending: false }).limit(10),
    ]);

    const voteData = votes.data || [];
    const upvotes = voteData.filter(v => v.vote_type === 'up').length;
    const downvotes = voteData.filter(v => v.vote_type === 'down').length;

    // Get verdict distribution
    const { data: verdictData } = await supabaseAdmin
      .from('verification_reports')
      .select('verdict');

    const verdictDist = {};
    (verdictData || []).forEach(r => {
      verdictDist[r.verdict] = (verdictDist[r.verdict] || 0) + 1;
    });

    // Get topic distribution
    const { data: topicData } = await supabaseAdmin
      .from('articles')
      .select('topic');

    const topicDist = {};
    (topicData || []).forEach(a => {
      if (a.topic) topicDist[a.topic] = (topicDist[a.topic] || 0) + 1;
    });

    res.json({
      totalUsers: users.count || 0,
      totalArticles: articles.count || 0,
      totalVerifications: reports.count || 0,
      totalFlagged: flagged.count || 0,
      votes: { up: upvotes, down: downvotes, total: voteData.length },
      verdictDistribution: verdictDist,
      topicDistribution: topicDist,
      topSources: sources.data || [],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/disputes
router.get('/disputes', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { data: reports, error } = await supabaseAdmin
      .from('verification_reports')
      .select('*')
      .eq('is_public', false)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ reports: reports || [] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/reports/:id/override
router.put('/reports/:id/override', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { verdict, composite_score } = req.body;

    const { data, error } = await supabaseAdmin
      .from('verification_reports')
      .update({ verdict, composite_score, is_public: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await supabaseAdmin.from('admin_actions').insert({
      admin_id: req.user.id,
      action_type: 'override_verdict',
      target_type: 'report',
      target_id: req.params.id,
      details: { verdict, composite_score },
    });

    res.json({ report: data });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/notifications — send announcement
router.post('/notifications', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });

    const { data: users } = await supabaseAdmin.from('profiles').select('id');

    const notifications = (users || []).map(u => ({
      user_id: u.id,
      title,
      message,
      type: 'announcement',
    }));

    if (notifications.length > 0) {
      await supabaseAdmin.from('notifications').insert(notifications);
    }

    await supabaseAdmin.from('admin_actions').insert({
      admin_id: req.user.id,
      action_type: 'send_announcement',
      target_type: 'notification',
      details: { title, message, recipients: notifications.length },
    });

    res.json({ message: `Announcement sent to ${notifications.length} users` });
  } catch (err) {
    next(err);
  }
});

export default router;
