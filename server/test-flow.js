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

async function runTests() {
  console.log('--- Starting Full System Test ---');
  
  const testEmail = 'testuser' + Date.now() + '@example.com';
  const testPassword = 'password123';
  
  // 1. Create User via Admin (bypass rate limits)
  console.log('1. Creating user:', testEmail);
  const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Test Agent' }
  });
  
  if (adminErr) {
    console.error('Failed to create user:', adminErr);
    return;
  }
  
  // 2. Sign In to get JWT
  console.log('2. Signing in to get JWT...');
  const { data: authData, error: authErr } = await supabaseClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (authErr) {
    console.error('Failed to sign in:', authErr);
    return;
  }
  
  const token = authData.session.access_token;
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // 3. Test Dashboard / News endpoint
  console.log('3. Fetching News Feed...');
  try {
    const { data: newsData } = await api.get('/news?topic=technology');
    console.log(`   Success! Retrieved ${newsData.articles?.length || 0} articles.`);
  } catch (err) {
    console.error('   News fetch failed:', err.response?.data || err.message);
  }
  
  // 4. Test Verification Endpoint (hits ML Service)
  console.log('4. Verifying a URL (testing ML Service integration)...');
  try {
    const { data: verifyData } = await api.post('/verify/url', {
      url: 'https://edition.cnn.com/2024/02/10/politics/biden-classified-documents-report/index.html'
    });
    console.log(`   Success! Verification complete.`);
    console.log(`   - Composite Score: ${verifyData.report.composite_score}`);
    console.log(`   - Verdict: ${verifyData.report.verdict}`);
  } catch (err) {
    console.error('   Verification failed:', err.response?.data || err.message);
  }
  
  console.log('--- Tests Complete ---');
}

runTests();
