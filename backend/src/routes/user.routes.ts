import { Router } from 'express';
import {
  getMe,
  updateMe,
  changePassword,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { changePasswordSchema } from '../validators/auth.validator';

const router = Router();

// Protect all routes
router.use(protect);

// User profile routes
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/change-password', validateRequest(changePasswordSchema), changePassword);

// Admin-only user management routes
router.get('/', restrictTo('ADMIN'), getAllUsers);
router.put('/:id/role', restrictTo('ADMIN'), updateUserRole);
router.put('/:id/status', restrictTo('ADMIN'), updateUserStatus);

export default router;
