import { Router } from 'express';
import { getDashboardStats } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Secure all routes in this file
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/stats', getDashboardStats);

export default router;
