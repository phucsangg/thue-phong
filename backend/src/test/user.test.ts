import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { generateAccessToken } from '../utils/token';

describe('User and Permission Integration Tests', () => {
  let adminToken: string;
  let user1Token: string;
  let adminUser: any;
  let user1: any;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin-perm@example.com',
      passwordHash: 'hashed_password',
      role: 'ADMIN',
    });

    user1 = await User.create({
      name: 'User One',
      email: 'user-perm@example.com',
      passwordHash: 'hashed_password_123',
      role: 'USER',
    });

    adminToken = generateAccessToken({ userId: adminUser._id.toString(), role: 'ADMIN' });
    user1Token = generateAccessToken({ userId: user1._id.toString(), role: 'USER' });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user information', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe('user-perm@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Sanitize check
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('should allow user to update name and phone', async () => {
      const res = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Updated Name',
          phone: '9876543210',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
      expect(res.body.data.user.phone).toBe('9876543210');
    });
  });

  describe('Admin Role-based Permissions Control', () => {
    it('should allow Admin to list all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(2);
    });

    it('should prevent standard User from listing all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow Admin to update user role', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${user1._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'ADMIN',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('updated to ADMIN');

      const updated = await User.findById(user1._id);
      expect(updated!.role).toBe('ADMIN');
    });

    it('should prevent standard User from updating user roles', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${user1._id}/role`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          role: 'ADMIN',
        });

      expect(res.statusCode).toBe(403);
    });
  });
});
