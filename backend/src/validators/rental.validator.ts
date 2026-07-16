import { z } from 'zod';
import { Types } from 'mongoose';

export const createRentalRequestSchema = z.object({
  room: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid room ID format',
  }),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  durationMonths: z.number().int().positive('Duration must be at least 1 month'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
});

export const rejectRentalRequestSchema = z.object({
  note: z.string().max(200, 'Note cannot exceed 200 characters').optional(),
});
