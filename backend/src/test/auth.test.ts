import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

describe('Auth Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully with USER role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          phone: '0123456789',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Exclude passwordHash

      // Verify in DB
      const dbUser = await User.findOne({ email: 'jane@example.com' });
      expect(dbUser).toBeDefined();
      expect(dbUser!.role).toBe('USER'); // Enforce role
    });

    it('should prevent registration if email is already registered', async () => {
      await User.create({
        name: 'Existing User',
        email: 'jane@example.com',
        passwordHash: 'dummy_hash',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Email is already registered');
    });

    it('should reject registration with invalid email or password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'invalid-email',
          password: '123', // Too short
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login and return access and refresh tokens', async () => {
      // Register a user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');

      // Verify refresh token is saved in DB
      const storedToken = await RefreshToken.findOne({ token: res.body.data.refreshToken });
      expect(storedToken).toBeDefined();
    });

    it('should reject login with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should issue a new access token when provided a valid refresh token', async () => {
      // Create user and log in
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        });

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: loginRes.body.data.refreshToken,
        });

      expect(refreshRes.statusCode).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();
    });

    it('should reject refresh-token request if token is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: 'invalid_token_value',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid refresh token');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should remove refresh token from database on logout', async () => {
      // Create user and log in
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        });

      const token = loginRes.body.data.refreshToken;

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: token,
        });

      expect(logoutRes.statusCode).toBe(200);
      expect(logoutRes.body.message).toContain('Logged out successfully');

      // Verify token deleted
      const storedToken = await RefreshToken.findOne({ token });
      expect(storedToken).toBeNull();
    });
  });
});
