import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const testEmail = 'e2e_test_' + Date.now() + '@truthlens.com';
const testPassword = 'TestPass123!';
let token = null;
let userId = null;
let api = null;

const results = [];
function log(test, pass, detail = '') {
  const icon = pass ? '✅' : '❌';
  results.push({ test, pass, detail });
  console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
}

async function run() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║    TruthLens — Full End-to-End Test Suite        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // ─── 1. REGISTRATION ────────────────────────────────────────
  console.log('── 1. Auth Flow ──');

  try {
    // Create user via admin API (bypasses rate limiting)
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: 'E2E Test User' }
    });

    if (createErr) throw createErr;
    userId = newUser.user.id;
    log('User Registration', true, testEmail);
  } catch (err) {
    log('User Registration', false, err.message);
    return;
  }

  // Sign in
  try {
    const { data: signInData, error: signInErr } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    if (signInErr) throw signInErr;
    token = signInData.session.access_token;
    log('User Login', true);
  } catch (err) {
    log('User Login', false, err.message);
    return;
  }

  // Create API client
  api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true // don't throw on non-2xx
  });

  // ─── 2. PROFILE ─────────────────────────────────────────────
  console.log('\n── 2. Profile ──');

  try {
    const res = await api.get('/profile');
    if (res.status === 200 && res.data.profile) {
      log('GET /profile', true, `name="${res.data.profile.full_name}"`);
    } else {
      log('GET /profile', false, `status=${res.status} body=${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    log('GET /profile', false, err.message);
  }

  try {
    const res = await api.put('/profile', { full_name: 'Updated E2E User', bio: 'Testing bio' });
    if (res.status === 200 && res.data.profile) {
      log('PUT /profile (update)', true, `name="${res.data.profile.full_name}"`);
    } else {
      log('PUT /profile (update)', false, `status=${res.status} body=${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    log('PUT /profile (update)', false, err.message);
  }

  try {
    const res = await api.put('/profile/preferences', { topics: ['Technology', 'Science'] });
    if (res.status === 200) {
      log('PUT /profile/preferences', true);
    } else {
      log('PUT /profile/preferences', false, `status=${res.status} body=${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    log('PUT /profile/preferences', false, err.message);
  }

  // ─── 3. NEWS ────────────────────────────────────────────────
  console.log('\n── 3. News Feed ──');

  let articleId = null;
  try {
    const res = await api.get('/news');
    if (res.status === 200 && Array.isArray(res.data.articles)) {
      articleId = res.data.articles[0]?.id;
      log('GET /news', true, `${res.data.articles.length} articles`);
    } else {
      log('GET /news', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
    }
  } catch (err) {
    log('GET /news', false, err.message);
  }

  try {
    const res = await api.get('/news?topic=technology');
    if (res.status === 200) {
      log('GET /news?topic=technology', true, `${res.data.articles?.length || 0} articles`);
    } else {
      log('GET /news?topic=technology', false, `status=${res.status}`);
    }
  } catch (err) {
    log('GET /news?topic=technology', false, err.message);
  }

  if (articleId) {
    try {
      const res = await api.get(`/news/${articleId}`);
      if (res.status === 200 && res.data.article) {
        log('GET /news/:id', true, `title="${res.data.article.title?.substring(0, 50)}..."`);
      } else {
        log('GET /news/:id', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
      }
    } catch (err) {
      log('GET /news/:id', false, err.message);
    }
  }

  // ─── 4. VERIFICATION ───────────────────────────────────────
  console.log('\n── 4. Verification ──');

  let reportId = null;
  try {
    const res = await api.post('/verify/text', {
      text: 'Scientists have discovered that drinking coffee every day can increase your lifespan by up to 20 years.',
      source_name: 'Test Source'
    });
    if (res.status === 200 || res.status === 201) {
      reportId = res.data.report?.id;
      log('POST /verify/text', true, `verdict="${res.data.report?.verdict}", score=${res.data.report?.composite_score}`);
    } else {
      log('POST /verify/text', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,300)}`);
    }
  } catch (err) {
    log('POST /verify/text', false, err.message);
  }

  if (reportId) {
    try {
      const res = await api.get(`/verify/reports/${reportId}`);
      if (res.status === 200 && res.data.report) {
        log('GET /verify/reports/:id (report)', true, `verdict="${res.data.report.verdict}"`);
      } else {
        log('GET /verify/reports/:id (report)', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
      }
    } catch (err) {
      log('GET /verify/:id (report)', false, err.message);
    }
  }

  // ─── 5. BOOKMARKS ──────────────────────────────────────────
  console.log('\n── 5. Bookmarks ──');

  let bookmarkId = null;
  if (articleId) {
    try {
      const res = await api.post('/bookmarks', { type: 'article', article_id: articleId });
      if (res.status === 200 || res.status === 201) {
        bookmarkId = res.data.bookmark?.id;
        log('POST /bookmarks (article)', true);
      } else {
        log('POST /bookmarks (article)', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
      }
    } catch (err) {
      log('POST /bookmarks (article)', false, err.message);
    }
  }

  try {
    const res = await api.get('/bookmarks');
    if (res.status === 200 && Array.isArray(res.data.bookmarks)) {
      log('GET /bookmarks', true, `${res.data.bookmarks.length} bookmarks`);
    } else {
      log('GET /bookmarks', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
    }
  } catch (err) {
    log('GET /bookmarks', false, err.message);
  }

  if (bookmarkId) {
    try {
      const res = await api.delete(`/bookmarks/${bookmarkId}`);
      if (res.status === 200 || res.status === 204) {
        log('DELETE /bookmarks/:id', true);
      } else {
        log('DELETE /bookmarks/:id', false, `status=${res.status}`);
      }
    } catch (err) {
      log('DELETE /bookmarks/:id', false, err.message);
    }
  }

  // ─── 6. VOTES ──────────────────────────────────────────────
  console.log('\n── 6. Votes ──');

  if (reportId) {
    try {
      const res = await api.post('/votes', { report_id: reportId, vote_type: 'up' });
      if (res.status === 200 || res.status === 201) {
        log('POST /votes (upvote)', true);
      } else {
        log('POST /votes (upvote)', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
      }
    } catch (err) {
      log('POST /votes (upvote)', false, err.message);
    }
  }

  // ─── 7. SOURCES ─────────────────────────────────────────────
  console.log('\n── 7. Sources ──');

  try {
    const res = await api.get('/sources');
    if (res.status === 200 && Array.isArray(res.data.sources)) {
      log('GET /sources', true, `${res.data.sources.length} sources`);
    } else {
      log('GET /sources', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
    }
  } catch (err) {
    log('GET /sources', false, err.message);
  }

  // ─── 8. NOTIFICATIONS ──────────────────────────────────────
  console.log('\n── 8. Notifications ──');

  try {
    const res = await api.get('/notifications');
    if (res.status === 200) {
      log('GET /notifications', true, `${res.data.notifications?.length || 0} notifications`);
    } else {
      log('GET /notifications', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
    }
  } catch (err) {
    log('GET /notifications', false, err.message);
  }

  // ─── 9. VERIFICATION HISTORY ───────────────────────────────
  console.log('\n── 9. Verification History ──');

  try {
    const res = await api.get('/profile/history');
    if (res.status === 200 && Array.isArray(res.data.reports)) {
      log('GET /profile/history', true, `${res.data.reports.length} reports`);
    } else {
      log('GET /profile/history', false, `status=${res.status} body=${JSON.stringify(res.data).substring(0,200)}`);
    }
  } catch (err) {
    log('GET /profile/history', false, err.message);
  }

  // ─── 10. ML SERVICE HEALTH ─────────────────────────────────
  console.log('\n── 10. ML Service ──');

  try {
    const res = await axios.get('http://localhost:8000/health');
    if (res.status === 200) {
      log('ML /health', true, JSON.stringify(res.data));
    } else {
      log('ML /health', false, `status=${res.status}`);
    }
  } catch (err) {
    log('ML /health', false, err.message);
  }

  // ─── CLEANUP ───────────────────────────────────────────────
  console.log('\n── Cleanup ──');
  try {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    log('Delete test user', true);
  } catch (err) {
    log('Delete test user', false, err.message);
  }

  // ─── SUMMARY ───────────────────────────────────────────────
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed, ${failed} failed out of ${results.length} tests   `);
  console.log('╚══════════════════════════════════════════════════╝');

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  ❌ ${r.test}: ${r.detail}`);
    });
  }
}

run().catch(err => console.error('Fatal error:', err));
