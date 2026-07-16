import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Room, RoomType, RoomStatus } from '../models/Room';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import cloudinary from '../config/cloudinary';

// Helper to check MongoDB ObjectId validity
export const checkObjectId = (id: any, next: NextFunction): boolean => {
  if (!Types.ObjectId.isValid(id)) {
    next(new AppError('Invalid database ID format', 400));
    return false;
  }
  return true;
};

// Helper to upload a buffer stream to Cloudinary
export const uploadStreamToCloudinary = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'rentnow' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || '');
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Helper to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now(); // Append timestamp to guarantee uniqueness
};

// @desc    Get all rooms with search, filter, sort and pagination
// @route   GET /api/v1/rooms
// @access  Public
export const getAllRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      roomType,
      status,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      city,
      district,
      amenities,
      sort,
    } = req.query;

    const query: any = {};

    // For Guests, filter out HIDDEN rooms. Only ADMIN can query HIDDEN rooms.
    // Determine user role if authorization token is passed (optional check)
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key');
        if (decoded.role === 'ADMIN') {
          isAdmin = true;
        }
      } catch (e) {
        // Suppress and treat as guest
      }
    }

    if (!isAdmin) {
      query.status = { $ne: 'HIDDEN' };
    }

    // Apply specific status filter
    if (status) {
      if (status === 'HIDDEN' && !isAdmin) {
        return next(new AppError('Forbidden to view hidden rooms', 403));
      }
      query.status = status;
    }

    // Search query — matches name, description, city, district, address
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { district: searchRegex },
        { address: searchRegex },
      ];
    }

    // Filters
    if (roomType) query.roomType = roomType;
    if (city) query.city = { $regex: `^${city}$`, $options: 'i' };
    if (district) query.district = { $regex: `^${district}$`, $options: 'i' };

    // Price Filter
    if (priceMin || priceMax) {
      query.pricePerMonth = {};
      if (priceMin) query.pricePerMonth.$gte = Number(priceMin);
      if (priceMax) query.pricePerMonth.$lte = Number(priceMax);
    }

    // Area Filter
    if (areaMin || areaMax) {
      query.area = {};
      if (areaMin) query.area.$gte = Number(areaMin);
      if (areaMax) query.area.$lte = Number(areaMax);
    }

    // Amenities Filter (comma-separated or array)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : (amenities as string).split(',').map((a) => a.trim());
      query.amenities = { $all: amenitiesList };
    }

    // Sort setup
    let sortOptions: any = { createdAt: -1 }; // Default
    if (sort) {
      const sortStr = sort as string;
      if (sortStr === 'priceAsc') sortOptions = { pricePerMonth: 1 };
      else if (sortStr === 'priceDesc') sortOptions = { pricePerMonth: -1 };
      else if (sortStr === 'areaAsc') sortOptions = { area: 1 };
      else if (sortStr === 'areaDesc') sortOptions = { area: -1 };
      else if (sortStr === 'oldest') sortOptions = { createdAt: 1 };
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const rooms = await Room.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    const totalRooms = await Room.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: rooms.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRooms / limitNum),
        totalRooms,
      },
      data: {
        rooms,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured rooms
// @route   GET /api/v1/rooms/featured
// @access  Public
export const getFeaturedRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rooms = await Room.find({ isFeatured: true, status: 'AVAILABLE' })
      .limit(6)
      .populate('createdBy', 'name email');

    res.status(200).json({
      status: 'success',
      results: rooms.length,
      data: {
        rooms,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by slug
// @route   GET /api/v1/rooms/:slug
// @access  Public
export const getRoomBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({ slug }).populate('createdBy', 'name email phone avatar');

    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    // If HIDDEN, check if requester is Admin
    if (room.status === 'HIDDEN') {
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer')) {
        try {
          const token = authHeader.split(' ')[1];
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key');
          if (decoded.role === 'ADMIN') {
            isAdmin = true;
          }
        } catch (e) {}
      }

      if (!isAdmin) {
        return next(new AppError('You do not have permission to view this room', 403));
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        room,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create room (Admin only)
// @route   POST /api/v1/rooms
// @access  Private/Admin
export const createRoom = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = generateSlug(req.body.name);
    const createdBy = req.user!._id;

    const newRoom = await Room.create({
      ...req.body,
      slug,
      createdBy,
    });

    res.status(201).json({
      status: 'success',
      data: {
        room: newRoom,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room (Admin only)
// @route   PUT /api/v1/rooms/:id
// @access  Private/Admin
export const updateRoom = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!checkObjectId(id, next)) return;

    const room = await Room.findById(id);
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    // Re-generate slug if name changed
    if (req.body.name && req.body.name !== room.name) {
      req.body.slug = generateSlug(req.body.name);
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        room: updatedRoom,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room (Admin only)
// @route   DELETE /api/v1/rooms/:id
// @access  Private/Admin
export const deleteRoom = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!checkObjectId(id, next)) return;

    const room = await Room.findById(id);
    if (!room) {
      return next(new AppError('Room not found', 404));
    }

    await Room.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload room images (Admin only)
// @route   POST /api/v1/rooms/upload-images
// @access  Private/Admin
export const uploadRoomImages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return next(new AppError('Please upload at least one image file', 400));
    }

    const files = req.files as Express.Multer.File[];
    const uploadPromises = files.map((file) => uploadStreamToCloudinary(file.buffer));
    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      status: 'success',
      data: {
        images: imageUrls,
      },
    });
  } catch (error) {
    next(new AppError('Image upload failed. Please try again.', 500));
  }
};
