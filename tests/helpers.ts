import request from 'supertest';
import app from '../src/app';

export async function login(email: string, password = 'Password123!'): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data.token;
}

export const superAdminToken = () => login('super@sigma-talenta.com');
export const professionalAdminToken = () => login('admin-professional@sigma-talenta.com');

export const PRO_ID = '10000000-0000-4000-8000-000000000002';
export const MAIN_ID = '10000000-0000-4000-8000-000000000001';
