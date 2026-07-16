import { Schema, model, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  user: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: [true, 'Token string is required'],
      unique: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// TTL Index: automatically delete document when current date passes expiresAt
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
