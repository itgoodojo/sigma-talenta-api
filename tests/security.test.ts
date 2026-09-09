import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';
import { MAIN_ID, professionalAdminToken, superAdminToken } from './helpers';

describe('Security', () => {
  it('password_hash is never returned', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'super@sigma-talenta.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('password_hash');

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${res.body.data.token}`);
    expect(JSON.stringify(me.body)).not.toContain('password_hash');
  });

  it('invalid payload is rejected (400)', async () => {
    const token = await professionalAdminToken();
    const res = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '', slug: 'INVALID SLUG!!' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('unauthorized product modification returns 403', async () => {
    const superTok = await superAdminToken();
    const proTok = await professionalAdminToken();
    const created = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${superTok}`)
      .send({ productId: MAIN_ID, title: 'Sec Test', slug: 'sec-test', status: 'DRAFT' });
    expect(created.status).toBe(201);

    const res = await request(app)
      .put(`/api/admin/articles/${created.body.data.id}`)
      .set('Authorization', `Bearer ${proTok}`)
      .send({ title: 'Hacked' });
    expect(res.status).toBe(403);
  });
});
