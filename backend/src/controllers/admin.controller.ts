import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { RentalRequest } from '../models/RentalRequest';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalRequests = await RentalRequest.countDocuments();

    // Rooms by status
    const roomsAvailable = await Room.countDocuments({ status: 'AVAILABLE' });
    const roomsRented = await Room.countDocuments({ status: 'RENTED' });
    const roomsMaintenance = await Room.countDocuments({ status: 'MAINTENANCE' });
    const roomsHidden = await Room.countDocuments({ status: 'HIDDEN' });

    // Requests by status
    const requestsPending = await RentalRequest.countDocuments({ status: 'PENDING' });
    const requestsApproved = await RentalRequest.countDocuments({ status: 'APPROVED' });
    const requestsRejected = await RentalRequest.countDocuments({ status: 'REJECTED' });
    const requestsCancelled = await RentalRequest.countDocuments({ status: 'CANCELLED' });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalRooms,
          totalRequests,
          rooms: {
            AVAILABLE: roomsAvailable,
            RENTED: roomsRented,
            MAINTENANCE: roomsMaintenance,
            HIDDEN: roomsHidden,
          },
          requests: {
            PENDING: requestsPending,
            APPROVED: requestsApproved,
            REJECTED: requestsRejected,
            CANCELLED: requestsCancelled,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
