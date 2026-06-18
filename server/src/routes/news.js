import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';
import authenticate from '../middleware/auth.js';
import requireAdmin from '../middleware/admin.js';
import { fetchAllTopics } from '../services/newsService.js';

const router = Router();

// GET /api/news — list articles, filter by topic and country, paginated
router.get('/', async (req, res, next) => {
  try {
    const { topic, country, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (topic && topic !== 'all') {
      query = query.ilike('topic', `%${topic}%`);
    }

    if (country) {
      query = query.eq('country', country);
    }

    const { data: articles, error, count } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      articles: articles || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/news/trending — trending articles
router.get('/trending', async (req, res, next) => {
  try {
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .not('credibility_score', 'is', null)
      .limit(10);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ articles: articles || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/news/search — search articles
router.get('/search', async (req, res, next) => {
  try {
    const { keyword, topic, source, from, to, credibility, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }
    if (topic && topic !== 'all') {
      query = query.ilike('topic', `%${topic}%`);
    }
    if (source) {
      query = query.ilike('source_name', `%${source}%`);
    }
    if (from) {
      query = query.gte('published_at', from);
    }
    if (to) {
      query = query.lte('published_at', to);
    }
    if (credibility) {
      const [min, max] = credibility.split('-').map(Number);
      if (!isNaN(min)) query = query.gte('credibility_score', min);
      if (!isNaN(max)) query = query.lte('credibility_score', max);
    }

    const { data: articles, error, count } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      articles: articles || [],
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/news/fetch-now — admin-only: trigger immediate news fetch
router.get('/fetch-now', authenticate, requireAdmin, async (req, res, next) => {
  try {
    logger.info(`Admin ${req.user.id} triggered manual news fetch`);
    const totalInserted = await fetchAllTopics();

    res.json({
      message: 'News fetch completed',
      totalInserted,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/news/:id — single article
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('*, sources(*)')
      .eq('id', id)
      .single();

    if (error || !article) return res.status(404).json({ error: 'Article not found' });
    res.json({ article });
  } catch (err) {
    next(err);
  }
});

export default router;
