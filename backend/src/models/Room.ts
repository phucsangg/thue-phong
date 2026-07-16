import { Schema, model, Document, Types } from 'mongoose';

export type RoomType = 'SINGLE' | 'DOUBLE' | 'STUDIO' | 'APARTMENT' | 'WHOLE_HOUSE';
export type RoomStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'HIDDEN';

export interface IReview {
  tenantName: string;
  avatar?: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export interface IRoom extends Document {
  name: string;
  slug: string;
  roomType: RoomType;
  description: string;
  address: string;
  district: string;
  city: string;
  pricePerMonth: number;
  area: number;
  maxPeople: number;
  status: RoomStatus;
  amenities: string[];
  images: string[];
  isFeatured: boolean;
  reviews: IReview[];
  rating: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      enum: ['SINGLE', 'DOUBLE', 'STUDIO', 'APARTMENT', 'WHOLE_HOUSE'],
      required: [true, 'Room type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    pricePerMonth: {
      type: Number,
      required: [true, 'Price per month is required'],
      min: [0, 'Price must be positive'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be at least 1 sqm'],
    },
    maxPeople: {
      type: Number,
      required: [true, 'Maximum people allowed is required'],
      min: [1, 'Capacity must be at least 1 person'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'HIDDEN'],
      default: 'AVAILABLE',
      required: [true, 'Status is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User reference is required'],
    },
    reviews: {
      type: [{
        tenantName: { type: String, required: true },
        avatar: { type: String },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }],
      default: [],
    },
    rating: {
      type: Number,
      default: 5.0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomSchema.index({ pricePerMonth: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ isFeatured: 1 });
roomSchema.index({ district: 1, city: 1 });
roomSchema.index({ roomType: 1 });

export const Room = model<IRoom>('Room', roomSchema);
