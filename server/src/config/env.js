import dotenv from 'dotenv';
dotenv.config();

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  CURRENTS_API_KEY: process.env.CURRENTS_API_KEY || '',
  GOOGLE_FACT_CHECK_API_KEY: process.env.GOOGLE_FACT_CHECK_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default env;
