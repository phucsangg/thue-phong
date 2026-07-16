import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { RentalRequest } from '../models/RentalRequest';
import { generateAccessToken } from '../utils/token';

describe('Rental Request Integration Tests', () => {
  let adminToken: string;
  let user1Token: string;
  let user2Token: string;
  let adminUser: any;
  let user1: any;
  let user2: any;
  let room1: any;
  let room2: any;

  beforeEach(async () => {
    // Setup test users in in-memory DB
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin-test@example.com',
      passwordHash: 'hashed_password',
      role: 'ADMIN',
    });

    user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      passwordHash: 'hashed_password',
      role: 'USER',
    });

    user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      passwordHash: 'hashed_password',
      role: 'USER',
    });

    adminToken = generateAccessToken({ userId: adminUser._id.toString(), role: 'ADMIN' });
    user1Token = generateAccessToken({ userId: user1._id.toString(), role: 'USER' });
    user2Token = generateAccessToken({ userId: user2._id.toString(), role: 'USER' });

    // Setup AVAILABLE room
    room1 = await Room.create({
      name: 'Available Room',
      slug: 'available-room-slug',
      roomType: 'STUDIO',
      description: 'A cozy studio room.',
      address: '101 Test Road',
      district: 'District 1',
      city: 'Ho Chi Minh',
      pricePerMonth: 400,
      area: 25,
      maxPeople: 2,
      status: 'AVAILABLE',
      createdBy: adminUser._id,
    });

    // Setup MAINTENANCE room
    room2 = await Room.create({
      name: 'Maintenance Room',
      slug: 'maintenance-room-slug',
      roomType: 'SINGLE',
      description: 'Under maintenance.',
      address: '102 Test Road',
      district: 'District 1',
      city: 'Ho Chi Minh',
      pricePerMonth: 300,
      area: 18,
      maxPeople: 1,
      status: 'MAINTENANCE',
      createdBy: adminUser._id,
    });
  });

  describe('POST /api/v1/rental-requests', () => {
    it('should submit a rental request successfully if room is available', async () => {
      const res = await request(app)
        .post('/api/v1/rental-requests')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          room: room1._id.toString(),
          startDate: '2026-08-01',
          durationMonths: 6,
          message: 'I want to rent this room',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.rentalRequest).toBeDefined();
      expect(res.body.data.rentalRequest.status).toBe('PENDING');

      // Verify in DB
      const reqInDb = await RentalRequest.findById(res.body.data.rentalRequest._id);
      expect(reqInDb).toBeDefined();
      expect(reqInDb!.durationMonths).toBe(6);
    });

    it('should prevent submission if room is not AVAILABLE', async () => {
      const res = await request(app)
        .post('/api/v1/rental-requests')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          room: room2._id.toString(),
          startDate: '2026-08-01',
          durationMonths: 6,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('not available for rent');
    });

    it('should prevent user from creating multiple pending requests for the same room', async () => {
      // First request
      await RentalRequest.create({
        room: room1._id,
        user: user1._id,
        startDate: new Date('2026-08-01'),
        durationMonths: 6,
        status: 'PENDING',
      });

      // Second request attempt
      const res = await request(app)
        .post('/api/v1/rental-requests')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          room: room1._id.toString(),
          startDate: '2026-08-01',
          durationMonths: 12,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('already have a pending rental request');
    });
  });

  describe('GET /api/v1/rental-requests/my', () => {
    it('should retrieve only the requests submitted by the logged-in user', async () => {
      await RentalRequest.create({
        room: room1._id,
        user: user1._id,
        startDate: new Date(),
        durationMonths: 3,
        status: 'PENDING',
      });

      await RentalRequest.create({
        room: room2._id,
        user: user2._id,
        startDate: new Date(),
        durationMonths: 12,
        status: 'PENDING',
      });

      const res = await request(app)
        .get('/api/v1/rental-requests/my')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(1);
      expect(res.body.data.rentalRequests[0].room._id).toBe(room1._id.toString());
    });
  });

  describe('POST /api/v1/rental-requests/:id/cancel', () => {
    it('should allow user to cancel their own pending request', async () => {
      const rr = await RentalRequest.create({
        room: room1._id,
        user: user1._id,
        startDate: new Date(),
        durationMonths: 6,
        status: 'PENDING',
      });

      const res = await request(app)
        .post(`/api/v1/rental-requests/${rr._id}/cancel`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.rentalRequest.status).toBe('CANCELLED');

      // Verify DB status
      const updated = await RentalRequest.findById(rr._id);
      expect(updated!.status).toBe('CANCELLED');
    });

    it('should prevent users from cancelling others requests', async () => {
      const rr = await RentalRequest.create({
        room: room1._id,
        user: user1._id,
        startDate: new Date(),
        durationMonths: 6,
        status: 'PENDING',
      });

      const res = await request(app)
        .post(`/api/v1/rental-requests/${rr._id}/cancel`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Admin Operations', () => {
    let rr1: any;
    let rr2: any;

    beforeEach(async () => {
      // User 1 requests Room 1
      rr1 = await RentalRequest.create({
        room: room1._id,
        user: user1._id,
        startDate: new Date(),
        durationMonths: 6,
        status: 'PENDING',
      });

      // User 2 requests Room 1 (competing request)
      rr2 = await RentalRequest.create({
        room: room1._id,
        user: user2._id,
        startDate: new Date(),
        durationMonths: 12,
        status: 'PENDING',
      });
    });

    it('should allow Admin to list all requests', async () => {
      const res = await request(app)
        .get('/api/v1/rental-requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(2);
    });

    it('should allow Admin to approve a request, mark room rented, and auto-reject competing requests', async () => {
      const res = await request(app)
        .put(`/api/v1/rental-requests/${rr1._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.rentalRequest.status).toBe('APPROVED');

      // Check room status is updated to RENTED
      const updatedRoom = await Room.findById(room1._id);
      expect(updatedRoom!.status).toBe('RENTED');

      // Check competing request rr2 was rejected automatically
      const updatedRr2 = await RentalRequest.findById(rr2._id);
      expect(updatedRr2!.status).toBe('REJECTED');
      expect(updatedRr2!.note).toContain('leased to another');
    });

    it('should allow Admin to reject a request with feedback note', async () => {
      const res = await request(app)
        .put(`/api/v1/rental-requests/${rr1._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          note: 'Credit check failed',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.rentalRequest.status).toBe('REJECTED');
      expect(res.body.data.rentalRequest.note).toBe('Credit check failed');

      // Room status should still be AVAILABLE
      const updatedRoom = await Room.findById(room1._id);
      expect(updatedRoom!.status).toBe('AVAILABLE');
    });
  });
});
