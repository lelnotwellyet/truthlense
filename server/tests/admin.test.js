import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/config/supabase.js', () => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { role: 'USER' }, error: null }),
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

describe('Admin Routes', () => {
  test('GET /api/admin/users should require auth', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/admin/analytics should require auth', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(401);
  });

  test('DELETE /api/admin/articles/:id should require auth', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app).delete('/api/admin/articles/some-id');
    expect(res.status).toBe(401);
  });

  test('POST /api/admin/notifications should require auth', async () => {
    const { default: app } = await import('../src/index.js');
    const { default: request } = await import('supertest');

    const res = await request(app)
      .post('/api/admin/notifications')
      .send({ title: 'Test', message: 'Test announcement' });

    expect(res.status).toBe(401);
  });
});
