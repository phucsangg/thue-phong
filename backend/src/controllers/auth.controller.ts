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

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      passwordPlain: password,
      phone,
      avatar,
      role: 'USER',
      isVerified: false,
      verificationToken,
      verificationTokenExpire,
    });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const message = `Chào mừng bạn đến với iSinhvien!\n\nVui lòng xác thực tài khoản của bạn bằng cách nhấp vào liên kết sau:\n\n${verifyUrl}\n\nLiên kết này sẽ hết hạn trong 24 giờ.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h2 style="color: #0072bc; text-align: center;">Chào mừng bạn đến với iSinhvien!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại iSinhvien - Nền tảng thuê phòng trọ sinh viên hàng đầu.</p>
        <p>Vui lòng nhấn vào nút bên dưới để xác thực tài khoản của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #0072bc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Xác thực tài khoản</a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Liên kết này sẽ hết hạn trong 24 giờ. Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject: '[iSinhvien] Xác thực tài khoản của bạn',
        text: message,
        html,
      });
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản.',
      data: {
        user: sanitizeUser(newUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email token
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Mã xác thực không hợp lệ hoặc đã hết hạn', 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Xác thực tài khoản thành công! Bây giờ bạn đã có thể đăng nhập.',
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

    // Check if email is verified
    if (!user.isVerified) {
      return next(new AppError('Tài khoản chưa được xác thực email. Vui lòng kiểm tra email của bạn.', 401));
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

    const subject = '[iSinhvien] Yêu cầu đặt lại mật khẩu';
    const text = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản iSinhvien của mình. Vui lòng nhấp vào liên kết sau để hoàn tất:\n\n${resetUrl}\n\nLiên kết này sẽ hết hạn trong 10 phút.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h2 style="color: #0072bc; text-align: center;">Đặt lại mật khẩu tài khoản</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản iSinhvien của bạn.</p>
        <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu mới. Liên kết này chỉ có hiệu lực trong vòng 10 phút:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0072bc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
        </div>
        <p style="color: #64748b; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ giữ nguyên không đổi.</p>
      </div>
    `;

    await sendEmail({ to: user.email, subject, text, html });

    res.status(200).json({
      status: 'success',
      message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.',
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
