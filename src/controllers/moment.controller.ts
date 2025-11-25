import { Request, Response } from 'express';
import { MomentModel } from '../models/moment.model';
import { CustomError, asyncHandler } from '../middleware/errorHandler';
import { CreateMomentData, UpdateMomentData, MomentFilters, NearbyFilters } from '../models/moment.types';
import { AuthenticatedRequest } from '../middleware/auth';

export class MomentController {
  static createMoment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { title, description, photo_url, mood, latitude, longitude } = req.body;
    const userId = req.user?.id || 'demo-user'; // TODO: Get from auth middleware

    // Validation
    if (!title || !description || !photo_url || !mood || latitude === undefined || longitude === undefined) {
      throw new CustomError('Missing required fields: title, description, photo_url, mood, latitude, longitude', 400);
    }

    const validMoods = ['happy', 'inspiring', 'thoughtful', 'excited', 'grateful', 'peaceful'];
    if (!validMoods.includes(mood)) {
      throw new CustomError(`Invalid mood. Must be one of: ${validMoods.join(', ')}`, 400);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new CustomError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180', 400);
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new CustomError('Latitude and longitude must be numbers', 400);
    }

    // Validate photo URL format (basic validation)
    try {
      new URL(photo_url);
    } catch {
      throw new CustomError('Invalid photo URL format', 400);
    }

    const momentData: CreateMomentData = {
      user_id: userId,
      title: title.trim(),
      description: description.trim(),
      photo_url: photo_url.trim(),
      mood,
      latitude,
      longitude,
    };

    const moment = await MomentModel.create(momentData);

    res.status(201).json({
      success: true,
      data: moment,
      message: 'Moment created successfully',
    });
  });

  static getMomentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new CustomError('Moment ID is required', 400);
    }

    const moment = await MomentModel.findById(id);

    if (!moment) {
      throw new CustomError('Moment not found', 404);
    }

    res.json({
      success: true,
      data: moment,
    });
  });

  static updateMoment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-user'; // TODO: Get from auth middleware
    const updateData: UpdateMomentData = {};

    // Validate and extract update data
    const { title, description, photo_url, mood, latitude, longitude } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        throw new CustomError('Title cannot be empty', 400);
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        throw new CustomError('Description cannot be empty', 400);
      }
      updateData.description = description.trim();
    }

    if (photo_url !== undefined) {
      if (!photo_url.trim()) {
        throw new CustomError('Photo URL cannot be empty', 400);
      }
      try {
        new URL(photo_url);
      } catch {
        throw new CustomError('Invalid photo URL format', 400);
      }
      updateData.photo_url = photo_url.trim();
    }

    if (mood !== undefined) {
      const validMoods = ['happy', 'inspiring', 'thoughtful', 'excited', 'grateful', 'peaceful'];
      if (!validMoods.includes(mood)) {
        throw new CustomError(`Invalid mood. Must be one of: ${validMoods.join(', ')}`, 400);
      }
      updateData.mood = mood;
    }

    if (latitude !== undefined && longitude !== undefined) {
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new CustomError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180', 400);
      }
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new CustomError('Latitude and longitude must be numbers', 400);
      }
      updateData.latitude = latitude;
      updateData.longitude = longitude;
    } else if (latitude !== undefined || longitude !== undefined) {
      throw new CustomError('Both latitude and longitude must be provided together', 400);
    }

    if (Object.keys(updateData).length === 0) {
      throw new CustomError('No valid update fields provided', 400);
    }

    const moment = await MomentModel.update(id, userId, updateData);

    if (!moment) {
      throw new CustomError('Moment not found or you do not have permission to update it', 404);
    }

    res.json({
      success: true,
      data: moment,
      message: 'Moment updated successfully',
    });
  });

  static deleteMoment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-user'; // TODO: Get from auth middleware

    if (!id) {
      throw new CustomError('Moment ID is required', 400);
    }

    const deleted = await MomentModel.delete(id, userId);

    if (!deleted) {
      throw new CustomError('Moment not found or you do not have permission to delete it', 404);
    }

    res.json({
      success: true,
      message: 'Moment deleted successfully',
    });
  });

  static listMoments = asyncHandler(async (req: Request, res: Response) => {
    const filters: MomentFilters = {};

    // Parse query parameters
    const { moods, start_date, end_date, user_id, limit, offset } = req.query;

    if (moods) {
      const moodArray = Array.isArray(moods) ? moods : [moods];
      const validMoods = ['happy', 'inspiring', 'thoughtful', 'excited', 'grateful', 'peaceful'];
      const parsedMoods = moodArray
        .map(mood => mood.toString().toLowerCase())
        .filter(mood => validMoods.includes(mood));

      if (parsedMoods.length > 0) {
        filters.moods = parsedMoods as any;
      }
    }

    if (start_date) {
      const startDate = new Date(start_date.toString());
      if (isNaN(startDate.getTime())) {
        throw new CustomError('Invalid start_date format. Use ISO date format', 400);
      }
      filters.start_date = startDate;
    }

    if (end_date) {
      const endDate = new Date(end_date.toString());
      if (isNaN(endDate.getTime())) {
        throw new CustomError('Invalid end_date format. Use ISO date format', 400);
      }
      filters.end_date = endDate;
    }

    if (user_id) {
      filters.user_id = user_id.toString();
    }

    if (limit) {
      const parsedLimit = parseInt(limit.toString());
      if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
        throw new CustomError('Invalid limit. Must be a positive number <= 100', 400);
      }
      filters.limit = parsedLimit;
    } else {
      filters.limit = 20; // Default limit
    }

    if (offset) {
      const parsedOffset = parseInt(offset.toString());
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        throw new CustomError('Invalid offset. Must be a non-negative number', 400);
      }
      filters.offset = parsedOffset;
    } else {
      filters.offset = 0; // Default offset
    }

    const moments = await MomentModel.findMany(filters);

    res.json({
      success: true,
      data: moments,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        count: moments.length,
      },
    });
  });

  static findNearbyMoments = asyncHandler(async (req: Request, res: Response) => {
    const { lat, lng, radius, moods, start_date, end_date, user_id, limit, offset } = req.query;

    // Validate required parameters
    if (lat === undefined || lng === undefined) {
      throw new CustomError('Latitude and longitude are required', 400);
    }

    const latitude = parseFloat(lat.toString());
    const longitude = parseFloat(lng.toString());

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new CustomError('Invalid latitude or longitude format', 400);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new CustomError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180', 400);
    }

    const radiusMeters = radius ? parseInt(radius.toString()) : 1000; // Default 1km
    if (isNaN(radiusMeters) || radiusMeters <= 0 || radiusMeters > 100000) {
      throw new CustomError('Invalid radius. Must be a positive number <= 100000 (100km)', 400);
    }

    const filters: NearbyFilters = {
      latitude,
      longitude,
      radius_meters: radiusMeters,
    };

    // Parse optional filters
    if (moods) {
      const moodArray = Array.isArray(moods) ? moods : [moods];
      const validMoods = ['happy', 'inspiring', 'thoughtful', 'excited', 'grateful', 'peaceful'];
      const parsedMoods = moodArray
        .map(mood => mood.toString().toLowerCase())
        .filter(mood => validMoods.includes(mood));

      if (parsedMoods.length > 0) {
        filters.moods = parsedMoods as any;
      }
    }

    if (start_date) {
      const startDate = new Date(start_date.toString());
      if (isNaN(startDate.getTime())) {
        throw new CustomError('Invalid start_date format. Use ISO date format', 400);
      }
      filters.start_date = startDate;
    }

    if (end_date) {
      const endDate = new Date(end_date.toString());
      if (isNaN(endDate.getTime())) {
        throw new CustomError('Invalid end_date format. Use ISO date format', 400);
      }
      filters.end_date = endDate;
    }

    if (user_id) {
      filters.user_id = user_id.toString();
    }

    if (limit) {
      const parsedLimit = parseInt(limit.toString());
      if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
        throw new CustomError('Invalid limit. Must be a positive number <= 100', 400);
      }
      filters.limit = parsedLimit;
    } else {
      filters.limit = 20; // Default limit
    }

    if (offset) {
      const parsedOffset = parseInt(offset.toString());
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        throw new CustomError('Invalid offset. Must be a non-negative number', 400);
      }
      filters.offset = parsedOffset;
    } else {
      filters.offset = 0; // Default offset
    }

    const moments = await MomentModel.findNearby(filters);

    res.json({
      success: true,
      data: moments,
      filters: {
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius_meters: filters.radius_meters,
      },
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        count: moments.length,
      },
    });
  });
}