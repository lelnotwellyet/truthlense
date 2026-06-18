import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/supabase.js', () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
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
  };
  return {
    supabase: { auth: { getUser: jest.fn() } },
    supabaseAdmin: { from: jest.fn(() => mockQuery), auth: { admin: { createUser: jest.fn() } } },
  };
});

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'no token' } }) },
  })),
}));

describe('News Routes', () => {
  test('GET /api/news should return articles array', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/news');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('articles');
    expect(Array.isArray(res.body.articles)).toBe(true);
  });

  test('GET /api/news should accept topic filter', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/news?topic=technology');
    expect(res.status).toBe(200);
  });

  test('GET /api/news/trending should return articles', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/news/trending');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('articles');
  });

  test('GET /api/news/search should support keyword', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/news/search?keyword=climate');
    expect(res.status).toBe(200);
  });

  test('GET /api/sources should return sources', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/sources');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sources');
  });
});
