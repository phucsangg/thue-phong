import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(3, 'Room name must be at least 3 characters').max(100),
  roomType: z.union([
    z.literal('SINGLE'),
    z.literal('DOUBLE'),
    z.literal('STUDIO'),
    z.literal('APARTMENT'),
    z.literal('WHOLE_HOUSE')
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  district: z.string().min(2, 'District must be at least 2 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  pricePerMonth: z.number().nonnegative('Price per month must be positive'),
  area: z.number().positive('Area must be greater than 0'),
  maxPeople: z.number().int().positive('Maximum capacity must be at least 1 person'),
  status: z.union([
    z.literal('AVAILABLE'),
    z.literal('RENTED'),
    z.literal('MAINTENANCE'),
    z.literal('HIDDEN')
  ]).default('AVAILABLE'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  isFeatured: z.boolean().default(false),
});

export const updateRoomSchema = createRoomSchema.partial();
