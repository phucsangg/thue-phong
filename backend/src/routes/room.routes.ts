import { Router } from 'express';
import {
  getAllRooms,
  getFeaturedRooms,
  getRoomBySlug,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
} from '../controllers/room.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createRoomSchema, updateRoomSchema } from '../validators/room.validator';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Guest routes
router.get('/', getAllRooms);
router.get('/featured', getFeaturedRooms);
router.get('/:slug', getRoomBySlug);

// Admin-only routes
router.post('/', protect, restrictTo('ADMIN'), validateRequest(createRoomSchema), createRoom);
router.put('/:id', protect, restrictTo('ADMIN'), validateRequest(updateRoomSchema), updateRoom);
router.delete('/:id', protect, restrictTo('ADMIN'), deleteRoom);
router.post('/upload-images', protect, restrictTo('ADMIN'), upload.array('images', 5), uploadRoomImages);

export default router;
