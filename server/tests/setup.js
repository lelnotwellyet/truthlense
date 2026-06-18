// Jest setup — mock environment variables
process.env.PORT = '5001';
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.ML_SERVICE_URL = 'http://localhost:8000';
process.env.GNEWS_API_KEY = 'test-gnews-key';
process.env.GOOGLE_FACT_CHECK_API_KEY = 'test-fact-check-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
