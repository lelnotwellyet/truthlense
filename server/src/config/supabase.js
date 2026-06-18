import { createClient } from '@supabase/supabase-js';
import env from './env.js';

// Public client — respects RLS, used for user-scoped operations
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Admin client — bypasses RLS, used for service-level operations
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
