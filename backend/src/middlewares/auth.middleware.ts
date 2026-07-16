import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { verifyAccessToken } from '../utils/token';
import { User, IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = verifyAccessToken(token);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
};

export const restrictTo = (...roles: ('ADMIN' | 'USER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
