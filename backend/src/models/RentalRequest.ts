import { Schema, model, Document, Types } from 'mongoose';

export type RentalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface IRentalRequest extends Document {
  room: Types.ObjectId;
  user: Types.ObjectId;
  startDate: Date;
  durationMonths: number;
  message?: string;
  status: RentalRequestStatus;
  note?: string; // admin comment
  createdAt: Date;
  updatedAt: Date;
}

const rentalRequestSchema = new Schema<IRentalRequest>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration in months is required'],
      min: [1, 'Duration must be at least 1 month'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      required: [true, 'Status is required'],
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
rentalRequestSchema.index({ room: 1, user: 1 });
rentalRequestSchema.index({ user: 1 });
rentalRequestSchema.index({ room: 1 });
rentalRequestSchema.index({ status: 1 });

export const RentalRequest = model<IRentalRequest>('RentalRequest', rentalRequestSchema);
