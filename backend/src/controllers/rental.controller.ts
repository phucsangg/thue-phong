import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { RentalRequest } from '../models/RentalRequest';
import { Room } from '../models/Room';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { checkObjectId } from './room.controller';

// @desc    Submit a rental request for a room
// @route   POST /api/v1/rental-requests
// @access  Private
export const createRentalRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { room: roomId, startDate, durationMonths, message } = req.body;
    const userId = req.user!._id;

    // Check room ObjectId
    if (!checkObjectId(roomId, next)) return;

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    // Business Rule: Only AVAILABLE rooms can accept rental requests
    if (room.status !== 'AVAILABLE') {
      return next(new AppError('This room is not available for rent at the moment', 400));
    }

    // Business Rule: A user cannot create multiple PENDING requests for the same room
    const existingPendingRequest = await RentalRequest.findOne({
      room: roomId,
      user: userId,
      status: 'PENDING',
    });

    if (existingPendingRequest) {
      return next(
        new AppError('You already have a pending rental request for this room', 400)
      );
    }

    const newRequest = await RentalRequest.create({
      room: roomId,
      user: userId,
      startDate: new Date(startDate),
      durationMonths,
      message,
      status: 'PENDING',
    });

    res.status(201).json({
      status: 'success',
      data: {
        rentalRequest: newRequest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's rental requests
// @route   GET /api/v1/rental-requests/my
// @access  Private
export const getMyRentalRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const requests = await RentalRequest.find({ user: userId })
      .populate('room', 'name slug pricePerMonth area images status address district city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: {
        rentalRequests: requests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending rental request
// @route   POST /api/v1/rental-requests/:id/cancel
// @access  Private
export const cancelRentalRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!checkObjectId(id, next)) return;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return next(new AppError('Rental request not found', 404));
    }

    // Business Rule: Users can only cancel their own requests (unless Admin)
    if (request.user.toString() !== req.user!._id.toString() && req.user!.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to cancel this request', 403));
    }

    // Business Rule: Can only cancel PENDING requests
    if (request.status !== 'PENDING') {
      return next(new AppError(`Cannot cancel a request that is already ${request.status}`, 400));
    }

    request.status = 'CANCELLED';
    await request.save();

    res.status(200).json({
      status: 'success',
      message: 'Rental request cancelled successfully',
      data: {
        rentalRequest: request,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rental requests (Admin only)
// @route   GET /api/v1/rental-requests
// @access  Private/Admin
export const getAllRentalRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requests = await RentalRequest.find()
      .populate('room', 'name slug pricePerMonth status')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: {
        rentalRequests: requests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a rental request (Admin only)
// @route   PUT /api/v1/rental-requests/:id/approve
// @access  Private/Admin
export const approveRentalRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!checkObjectId(id, next)) return;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return next(new AppError('Rental request not found', 404));
    }

    // Check if request is pending
    if (request.status !== 'PENDING') {
      return next(new AppError(`Request has already been processed (status: ${request.status})`, 400));
    }

    // Find the room
    const room = await Room.findById(request.room);
    if (!room) {
      return next(new AppError('Associated room not found', 404));
    }

    // Verify room is still available
    if (room.status !== 'AVAILABLE') {
      return next(new AppError('Room is no longer available for lease', 400));
    }

    // Approve request
    request.status = 'APPROVED';
    await request.save();

    // Mark room as RENTED
    room.status = 'RENTED';
    await room.save();

    // Reject all other PENDING requests for this room
    await RentalRequest.updateMany(
      {
        room: request.room,
        _id: { $ne: request._id },
        status: 'PENDING',
      },
      {
        status: 'REJECTED',
        note: 'Room has been leased to another applicant.',
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Rental request approved successfully. Room is marked as rented.',
      data: {
        rentalRequest: request,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a rental request (Admin only)
// @route   PUT /api/v1/rental-requests/:id/reject
// @access  Private/Admin
export const rejectRentalRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!checkObjectId(id, next)) return;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return next(new AppError('Rental request not found', 404));
    }

    if (request.status !== 'PENDING') {
      return next(new AppError(`Request has already been processed (status: ${request.status})`, 400));
    }

    request.status = 'REJECTED';
    request.note = note || 'Rejected by administrator.';
    await request.save();

    res.status(200).json({
      status: 'success',
      message: 'Rental request rejected successfully.',
      data: {
        rentalRequest: request,
      },
    });
  } catch (error) {
    next(error);
  }
};
