import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app';
import { MAIN_ID, professionalAdminToken, superAdminToken } from './helpers';

async function createInMain(entity: string, body: object, token: string) {
  return request(app)
    .post(`/api/admin/${entity}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ productId: MAIN_ID, ...body });
}

describe('CMS product isolation', () => {
  it('LandingPage isolation', async () => {
    const superTok = await superAdminToken();
    const proTok = await professionalAdminToken();
    const created = await createInMain('pages', { title: 'Main Page', slug: 'main-page-iso' }, superTok);
    expect(created.status).toBe(201);
    const res = await request(app)
      .get(`/api/admin/pages/${created.body.data.id}`)
      .set('Authorization', `Bearer ${proTok}`);
    expect(res.status).toBe(403);
  });

  it('FAQ isolation', async () => {
    const superTok = await superAdminToken();
    const proTok = await professionalAdminToken();
    const created = await createInMain('faqs', { question: 'Q?', answer: 'A' }, superTok);
    expect(created.status).toBe(201);
    const res = await request(app)
      .get(`/api/admin/faqs/${created.body.data.id}`)
      .set('Authorization', `Bearer ${proTok}`);
    expect(res.status).toBe(403);
  });

  it('Service isolation', async () => {
    const superTok = await superAdminToken();
    const proTok = await professionalAdminToken();
    const created = await createInMain('services', { title: 'Main Svc', slug: 'main-svc-iso' }, superTok);
    expect(created.status).toBe(201);
    const res = await request(app)
      .get(`/api/admin/services/${created.body.data.id}`)
      .set('Authorization', `Bearer ${proTok}`);
    expect(res.status).toBe(403);
  });

  it('Industry isolation', async () => {
    const superTok = await superAdminToken();
    const proTok = await professionalAdminToken();
    const created = await createInMain('industries', { name: 'Main Ind', slug: 'main-ind-iso' }, superTok);
    expect(created.status).toBe(201);
    const res = await request(app)
      .get(`/api/admin/industries/${created.body.data.id}`)
      .set('Authorization', `Bearer ${proTok}`);
    expect(res.status).toBe(403);
  });
});
