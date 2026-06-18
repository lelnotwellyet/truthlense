import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/supabase.js', () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 'test-report' }, error: null }),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };
  return {
    supabase: { auth: { getUser: jest.fn() } },
    supabaseAdmin: { from: jest.fn(() => mockQuery), auth: { admin: { createUser: jest.fn() } } },
  };
});

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: 'no' } }) },
  })),
}));

describe('Verify Routes', () => {
  test('POST /api/verify/text should require authentication', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app)
      .post('/api/verify/text')
      .send({ text: 'Some news article text for verification' });

    expect(res.status).toBe(401);
  });

  test('GET /api/verify/reports should require authentication', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/verify/reports');
    expect(res.status).toBe(401);
  });

  test('POST /api/verify/url should require authentication', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app)
      .post('/api/verify/url')
      .send({ url: 'https://example.com/article' });

    expect(res.status).toBe(401);
  });
});
