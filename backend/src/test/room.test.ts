import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { generateAccessToken } from '../utils/token';

describe('Room Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let standardUser: any;
  let testRoom: any;

  beforeEach(async () => {
    // Setup test users in in-memory DB
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin-test@example.com',
      passwordHash: 'hashed_password',
      role: 'ADMIN',
    });

    standardUser = await User.create({
      name: 'Test User',
      email: 'user-test@example.com',
      passwordHash: 'hashed_password',
      role: 'USER',
    });

    adminToken = generateAccessToken({ userId: adminUser._id.toString(), role: 'ADMIN' });
    userToken = generateAccessToken({ userId: standardUser._id.toString(), role: 'USER' });

    // Setup an initial room
    testRoom = await Room.create({
      name: 'Initial Room',
      slug: 'initial-room-slug',
      roomType: 'STUDIO',
      description: 'A cozy studio room for testing.',
      address: '101 Test Road',
      district: 'District 1',
      city: 'Ho Chi Minh',
      pricePerMonth: 400,
      area: 25,
      maxPeople: 2,
      status: 'AVAILABLE',
      amenities: ['Wifi', 'AC'],
      createdBy: adminUser._id,
    });
  });

  describe('GET /api/v1/rooms', () => {
    it('should return a list of non-hidden rooms', async () => {
      // Create a hidden room
      await Room.create({
        name: 'Secret Room',
        slug: 'secret-room-slug',
        roomType: 'SINGLE',
        description: 'Testing hidden room exclusion.',
        address: 'Secret Lane',
        district: 'District 3',
        city: 'Ho Chi Minh',
        pricePerMonth: 500,
        area: 20,
        maxPeople: 1,
        status: 'HIDDEN',
        createdBy: adminUser._id,
      });

      const res = await request(app).get('/api/v1/rooms');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.rooms).toBeDefined();
      
      // Hidden room should not be in the guest's response list
      const secret = res.body.data.rooms.find((r: any) => r.status === 'HIDDEN');
      expect(secret).toBeUndefined();
    });

    it('should support pagination, sorting, and filters', async () => {
      const res = await request(app)
        .get('/api/v1/rooms')
        .query({
          roomType: 'STUDIO',
          priceMax: 450,
          limit: 2,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.data.rooms.length).toBeGreaterThan(0);
      expect(res.body.data.rooms[0].roomType).toBe('STUDIO');
    });
  });

  describe('POST /api/v1/rooms', () => {
    it('should allow Admin to create a new room', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Newly Created Room',
          roomType: 'DOUBLE',
          description: 'A beautiful double room for rent.',
          address: '202 Luxury Ave',
          district: 'District 7',
          city: 'Ho Chi Minh',
          pricePerMonth: 700,
          area: 45,
          maxPeople: 3,
          status: 'AVAILABLE',
          amenities: ['Wifi', 'AC', 'Pool'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.room).toBeDefined();
      expect(res.body.data.room.name).toBe('Newly Created Room');
      expect(res.body.data.room.slug).toContain('newly-created-room');
    });

    it('should prevent standard User from creating a room', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Room Attempt',
          roomType: 'SINGLE',
          description: 'This should fail.',
          address: 'some address',
          district: 'dist',
          city: 'city',
          pricePerMonth: 100,
          area: 10,
          maxPeople: 1,
        });

      expect(res.statusCode).toBe(403);
    });

    it('should prevent Guest from creating a room', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .send({
          name: 'Guest Room Attempt',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/rooms/:id', () => {
    it('should allow Admin to update room details', async () => {
      const res = await request(app)
        .put(`/api/v1/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          pricePerMonth: 450,
          name: 'Updated Room Name',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.room.pricePerMonth).toBe(450);
      expect(res.body.data.room.name).toBe('Updated Room Name');
      expect(res.body.data.room.slug).toContain('updated-room-name');
    });

    it('should prevent standard User from updating room', async () => {
      const res = await request(app)
        .put(`/api/v1/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          pricePerMonth: 500,
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/v1/rooms/:id', () => {
    it('should prevent standard User from deleting room', async () => {
      const res = await request(app)
        .delete(`/api/v1/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow Admin to delete a room', async () => {
      const res = await request(app)
        .delete(`/api/v1/rooms/${testRoom._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      // Verify room is deleted from database
      const deletedRoom = await Room.findById(testRoom._id);
      expect(deletedRoom).toBeNull();
    });
  });
});
