import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';
const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';

export interface TokenPayload {
  userId: string;
  role: 'ADMIN' | 'USER';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpire } as any);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpire } as any);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, accessSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, refreshSecret) as TokenPayload;
};
