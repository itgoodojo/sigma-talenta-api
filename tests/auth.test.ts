import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';

describe('Authentication', () => {
  it('valid login returns token + user without password_hash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin-professional@sigma-talenta.com', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toContain('password_hash');
    expect(res.body.data.user.email).toBe('admin-professional@sigma-talenta.com');
  });

  it('invalid login returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin-professional@sigma-talenta.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('protected route without auth returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('protected route with invalid token returns 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
