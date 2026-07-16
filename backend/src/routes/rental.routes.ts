import { Router } from 'express';
import {
  createRentalRequest,
  getMyRentalRequests,
  cancelRentalRequest,
  getAllRentalRequests,
  approveRentalRequest,
  rejectRentalRequest,
} from '../controllers/rental.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createRentalRequestSchema,
  rejectRentalRequestSchema,
} from '../validators/rental.validator';

const router = Router();

// Authenticated routes
router.use(protect);

// User-level endpoints
router.post('/', restrictTo('USER', 'ADMIN'), validateRequest(createRentalRequestSchema), createRentalRequest);
router.get('/my', restrictTo('USER', 'ADMIN'), getMyRentalRequests);
router.post('/:id/cancel', restrictTo('USER', 'ADMIN'), cancelRentalRequest);

// Admin-level endpoints
router.get('/', restrictTo('ADMIN'), getAllRentalRequests);
router.put('/:id/approve', restrictTo('ADMIN'), approveRentalRequest);
router.put('/:id/reject', restrictTo('ADMIN'), validateRequest(rejectRentalRequestSchema), rejectRentalRequest);

export default router;
