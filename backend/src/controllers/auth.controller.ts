import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/errors';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token';
import { sendEmail } from '../utils/email';

// Helper to remove sensitive fields
const sanitizeUser = (user: IUser) => {
  const userObj = user.toObject();
  delete (userObj as any).passwordHash;
  delete (userObj as any).resetPasswordToken;
  delete (userObj as any).resetPasswordExpire;
  return userObj;
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already registered', 400));
    }

    // Force role to USER (do not trust front-end role payload)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      passwordPlain: password,
      phone,
      avatar,
      role: 'USER',
      isVerified: false,
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        user: sanitizeUser(newUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token to DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
    });

    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Check if refresh token is in DB
    const savedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!savedToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return next(new AppError('Expired or invalid refresh token', 401));
    }

    // Check user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.status(200).json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Public (Authenticated/Unauthenticated refresh body)
export const logout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Remove token from database
    await RefreshToken.deleteOne({ token: refreshToken });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('User not found with this email', 404));
    }

    // Generate reset token (random hex)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set expiry
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const subject = 'RentNow - Password Reset Request';
    const text = `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your RentNow account.</p>
        <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0d9488; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({ to: user.email, subject, text, html });

    res.status(200).json({
      status: 'success',
      message: 'Reset password link sent to email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!token) {
      return next(new AppError('Reset token is required', 400));
    }

    // Hash URL token
    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    // Find user by token and verify token hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Set new password
    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(password, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};
