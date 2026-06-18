import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import authenticate from '../middleware/auth.js';
import { verifyLimiter } from '../middleware/rateLimiter.js';
import { verifyText, verifyUrl, verifyImage } from '../services/mlService.js';
import { validateVerifyText, validateVerifyUrl } from '../utils/validators.js';
import logger from '../utils/logger.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Helper to save submission + report
async function saveVerificationResult(userId, type, input, mlResult) {
  const submission = {
    user_id: userId,
    type,
    content: input.text || null,
    url: input.url || null,
    status: 'completed',
  };

  const { data: sub, error: subError } = await supabaseAdmin
    .from('submissions')
    .insert(submission)
    .select()
    .single();

  if (subError) {
    logger.error('Failed to save submission:', subError);
    return { submission: null, report: null };
  }

  const composite = mlResult.composite || {};
  const mlPrediction = mlResult.ml_prediction || {};

  const report = {
    submission_id: sub.id,
    user_id: userId,
    title: input.title || (input.text ? input.text.substring(0, 100) : input.url || 'Image verification'),
    content_snippet: mlResult.text_preview || input.text?.substring(0, 300) || '',
    verdict: composite.verdict || 'Uncertain',
    composite_score: composite.composite_score || 50,
    ml_score: composite.breakdown?.ml_score || 50,
    ml_confidence: mlPrediction.confidence || 50,
    ml_prediction: mlPrediction.prediction || 'UNKNOWN',
    source_score: composite.breakdown?.source_score || 50,
    fact_check_score: composite.breakdown?.fact_check_score || 50,
    evidence: mlResult.fact_check?.evidence || [],
    source_name: mlResult.source?.name || null,
    is_public: true,
  };

  const { data: rep, error: repError } = await supabaseAdmin
    .from('verification_reports')
    .insert(report)
    .select()
    .single();

  if (repError) {
    logger.error('Failed to save report:', repError);
  }

  return { submission: sub, report: rep };
}

// POST /api/verify/text
router.post('/text', authenticate, verifyLimiter, validateVerifyText, async (req, res, next) => {
  try {
    const { text, source_name } = req.body;
    const mlResult = await verifyText(text, source_name);

    if (mlResult.error) {
      return res.status(502).json({ error: 'ML service unavailable', details: mlResult.error });
    }

    const { submission, report } = await saveVerificationResult(
      req.user.id, 'text', { text }, mlResult
    );

    res.json({ submission, report, ml_result: mlResult });
  } catch (err) {
    next(err);
  }
});

// POST /api/verify/url
router.post('/url', authenticate, verifyLimiter, validateVerifyUrl, async (req, res, next) => {
  try {
    const { url } = req.body;
    const mlResult = await verifyUrl(url);

    if (mlResult.error) {
      return res.status(502).json({ error: 'ML service unavailable', details: mlResult.error });
    }

    const { submission, report } = await saveVerificationResult(
      req.user.id, 'url', { url, title: mlResult.title }, mlResult
    );

    res.json({ submission, report, ml_result: mlResult });
  } catch (err) {
    next(err);
  }
});

// POST /api/verify/image
router.post('/image', authenticate, verifyLimiter, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only PNG, JPG, JPEG, and WEBP images are supported' });
    }

    const mlResult = await verifyImage(req.file.buffer, req.file.originalname);

    if (mlResult.error) {
      return res.status(502).json({ error: 'ML service unavailable', details: mlResult.error });
    }

    const { submission, report } = await saveVerificationResult(
      req.user.id, 'image', { text: mlResult.extracted_text || '' }, mlResult
    );

    res.json({ submission, report, ml_result: mlResult });
  } catch (err) {
    next(err);
  }
});

// GET /api/verify/reports
router.get('/reports', authenticate, async (req, res, next) => {
  try {
    const { public: isPublic, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('verification_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    } else {
      query = query.eq('user_id', req.user.id);
    }

    const { data: reports, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    res.json({ reports: reports || [], total: count || 0, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
});

// GET /api/verify/reports/:id
router.get('/reports/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: report, error } = await supabaseAdmin
      .from('verification_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !report) return res.status(404).json({ error: 'Report not found' });

    // Get vote counts
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('vote_type')
      .eq('report_id', id);

    const upvotes = (votes || []).filter(v => v.vote_type === 'up').length;
    const downvotes = (votes || []).filter(v => v.vote_type === 'down').length;

    res.json({ report, votes: { up: upvotes, down: downvotes, total: upvotes + downvotes } });
  } catch (err) {
    next(err);
  }
});

export default router;
