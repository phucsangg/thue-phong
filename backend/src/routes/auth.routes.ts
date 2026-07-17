import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  checkVerification,
} from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.get('/verify-email/:token', verifyEmail);
router.get('/check-verification/:email', checkVerification);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword);

export default router;
