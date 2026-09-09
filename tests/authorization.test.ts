import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';
import { MAIN_ID, PRO_ID, professionalAdminToken, superAdminToken } from './helpers';

describe('Authorization', () => {
  it('PRODUCT_ADMIN can access own product', async () => {
    const token = await professionalAdminToken();
    const create = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Own Product', slug: 'own-product', status: 'DRAFT' });
    expect(create.status).toBe(201);
    expect(create.body.data.productId).toBe(PRO_ID);

    const list = await request(app).get('/api/admin/articles').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    for (const a of list.body.data) expect(a.productId).toBe(PRO_ID);
  });

  it('PRODUCT_ADMIN cannot access another product', async () => {
    const superTok = await superAdminToken();
    const created = await request(app)
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${superTok}`)
      .send({ productId: MAIN_ID, title: 'Main Article', slug: 'main-auth-test', status: 'DRAFT' });
    expect(created.status).toBe(201);

    const token = await professionalAdminToken();
    const res = await request(app)
      .get(`/api/admin/articles/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('SUPER_ADMIN can access all products', async () => {
    const token = await superAdminToken();
    const res = await request(app).get('/api/admin/articles').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const products = new Set(res.body.data.map((a: { productId: string }) => a.productId));
    expect(products.has(PRO_ID)).toBe(true);
    expect(products.has(MAIN_ID)).toBe(true);
  });
});
