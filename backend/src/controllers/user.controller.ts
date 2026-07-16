import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { checkObjectId } from './room.controller';
import { changePasswordSchema } from '../validators/auth.validator';

const sanitizeUser = (user: IUser) => {
  const userObj = user.toObject();
  delete (userObj as any).passwordHash;
  delete (userObj as any).resetPasswordToken;
  delete (userObj as any).resetPasswordExpire;
  return userObj;
};

// @desc    Get current user details
// @route   GET /api/v1/users/me
// @access  Private
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('User session not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        user: sanitizeUser(req.user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/v1/users/me
// @access  Private
export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, avatar, gender, dateOfBirth, address, bio } = req.body;
    const user = req.user!;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (gender !== undefined) user.gender = gender;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: sanitizeUser(updatedUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/users/change-password
// @access  Private
export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user!;

    // Check password matches
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Incorrect current password', 400));
    }

    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    user.passwordPlain = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const sanitizedUsers = users.map((u) => sanitizeUser(u));

    res.status(200).json({
      status: 'success',
      results: sanitizedUsers.length,
      data: {
        users: sanitizedUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!checkObjectId(id, next)) return;

    if (!['ADMIN', 'USER'].includes(role)) {
      return next(new AppError('Invalid role format', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role} successfully`,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/v1/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (!checkObjectId(id, next)) return;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isVerified = isVerified;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User verification status updated successfully`,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};
