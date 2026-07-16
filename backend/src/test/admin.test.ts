import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { RentalRequest } from '../models/RentalRequest';
import { generateAccessToken } from '../utils/token';

describe('Admin Dashboard Stats Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let standardUser: any;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin-dashboard@example.com',
      passwordHash: 'hashed_password',
      role: 'ADMIN',
    });

    standardUser = await User.create({
      name: 'Standard User',
      email: 'user-dashboard@example.com',
      passwordHash: 'hashed_password',
      role: 'USER',
    });

    adminToken = generateAccessToken({ userId: adminUser._id.toString(), role: 'ADMIN' });
    userToken = generateAccessToken({ userId: standardUser._id.toString(), role: 'USER' });

    // Seed some documents to aggregate
    await Room.create({
      name: 'Available Nest',
      slug: 'available-nest',
      roomType: 'STUDIO',
      description: 'Test description details.',
      address: '101 test lane',
      district: 'D1',
      city: 'HCMC',
      pricePerMonth: 500,
      area: 25,
      maxPeople: 2,
      status: 'AVAILABLE',
      createdBy: adminUser._id,
    });

    await Room.create({
      name: 'Rented Nest',
      slug: 'rented-nest',
      roomType: 'SINGLE',
      description: 'Test description details.',
      address: '102 test lane',
      district: 'D1',
      city: 'HCMC',
      pricePerMonth: 300,
      area: 18,
      maxPeople: 1,
      status: 'RENTED',
      createdBy: adminUser._id,
    });
  });

  describe('GET /api/v1/admin/dashboard/stats', () => {
    it('should successfully retrieve stats for Admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.totalUsers).toBe(2);
      expect(res.body.data.stats.totalRooms).toBe(2);
      expect(res.body.data.stats.rooms.AVAILABLE).toBe(1);
      expect(res.body.data.stats.rooms.RENTED).toBe(1);
    });

    it('should prevent standard User from fetching dashboard stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should prevent Guest from fetching dashboard stats', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard/stats');
      expect(res.statusCode).toBe(401);
    });
  });
});
