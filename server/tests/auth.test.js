import { jest } from '@jest/globals';

// Mock supabase
jest.unstable_mockModule('../src/config/supabase.js', () => ({
  supabase: { auth: { getUser: jest.fn() } },
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
    })),
    auth: { admin: { createUser: jest.fn() } },
  },
}));

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-id', email: 'test@test.com' } }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: {}, session: {} }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    },
  })),
}));

describe('Auth Routes', () => {
  test('POST /api/auth/login should exist', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    // Should not return 404 (route exists)
    expect(res.status).not.toBe(404);
  });

  test('POST /api/auth/signup should validate input', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'invalid', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /api/auth/me should require authentication', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /health should return healthy', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
