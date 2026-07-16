import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('GET /', () => {
  it('should return 200 and the welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: 'success',
      message: 'Welcome to RentNow API',
      version: '1.0.0'
    });
  });
});
