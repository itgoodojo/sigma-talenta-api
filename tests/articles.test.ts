import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';
import { MAIN_ID, professionalAdminToken, superAdminToken } from './helpers';

describe('Articles', () => {
  it('draft article is not publicly visible', async () => {
    const token = await professionalAdminToken();
    await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Draft Art', slug: 'draft-art', status: 'DRAFT' });
    const res = await request(app).get('/api/public/articles/draft-art').set('X-Product', 'PROFESSIONAL');
    expect(res.status).toBe(404);
  });

  it('published article is publicly visible', async () => {
    const token = await professionalAdminToken();
    await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Pub Art', slug: 'pub-art', status: 'PUBLISHED' });
    const res = await request(app).get('/api/public/articles/pub-art').set('X-Product', 'PROFESSIONAL');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PUBLISHED');
  });

  it('archived article is not publicly visible', async () => {
    const token = await professionalAdminToken();
    await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Arch Art', slug: 'arch-art', status: 'ARCHIVED' });
    const res = await request(app).get('/api/public/articles/arch-art').set('X-Product', 'PROFESSIONAL');
    expect(res.status).toBe(404);
  });

  it('duplicate slug within product is rejected (409)', async () => {
    const token = await professionalAdminToken();
    await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Dup 1', slug: 'dup-slug', status: 'DRAFT' });
    const res = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Dup 2', slug: 'dup-slug', status: 'DRAFT' });
    expect(res.status).toBe(409);
  });

  it('same slug across different products is allowed', async () => {
    const superTok = await superAdminToken();
    const proTok = await professionalAdminToken();
    await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${proTok}`)
      .send({ title: 'Shared Pro', slug: 'shared-slug', status: 'DRAFT' });
    const res = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${superTok}`)
      .send({ productId: MAIN_ID, title: 'Shared Main', slug: 'shared-slug', status: 'DRAFT' });
    expect(res.status).toBe(201);
  });
});
