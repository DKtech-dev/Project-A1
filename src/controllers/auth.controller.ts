import { Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { PasswordUtils } from '../utils/password';
import { JWTUtils } from '../utils/jwt';
import { ValidationUtils } from '../utils/validation';
import { CustomError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import Logger from '../utils/logger';

export class AuthController {
  static async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, username } = req.body;

      if (!email || !password || !username) {
        throw new CustomError('Email, password, and username are required', 400);
      }

      if (!ValidationUtils.validateEmail(email)) {
        throw new CustomError('Invalid email format', 400);
      }

      const usernameValidation = ValidationUtils.validateUsername(username);
      if (!usernameValidation.valid) {
        throw new CustomError(usernameValidation.errors.join(', '), 400);
      }

      const passwordValidation = PasswordUtils.validate(password);
      if (!passwordValidation.valid) {
        throw new CustomError(passwordValidation.errors.join(', '), 400);
      }

      const emailExists = await UserModel.checkEmailExists(email);
      if (emailExists) {
        throw new CustomError('Email already exists', 409);
      }

      const hashedPassword = await PasswordUtils.hash(password);

      const user = await UserModel.create({
        email,
        password: hashedPassword,
        username,
      });

      const token = JWTUtils.generateToken({
        userId: user.id,
        email: user.email,
      });

      Logger.info('User registered successfully', { userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new CustomError('Email and password are required', 400);
      }

      if (!ValidationUtils.validateEmail(email)) {
        throw new CustomError('Invalid email format', 400);
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new CustomError('Invalid credentials', 401);
      }

      const isPasswordValid = await PasswordUtils.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401);
      }

      const token = JWTUtils.generateToken({
        userId: user.id,
        email: user.email,
      });

      Logger.info('User logged in successfully', { userId: user.id, email: user.email });

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      Logger.info('User logged out', { userId: req.user?.userId });

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new CustomError('User not authenticated', 401);
      }

      const user = await UserModel.findById(req.user.userId);

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new CustomError('User not authenticated', 401);
      }

      const { email, username } = req.body;

      if (!email && !username) {
        throw new CustomError('At least one field (email or username) is required', 400);
      }

      if (email && !ValidationUtils.validateEmail(email)) {
        throw new CustomError('Invalid email format', 400);
      }

      if (username) {
        const usernameValidation = ValidationUtils.validateUsername(username);
        if (!usernameValidation.valid) {
          throw new CustomError(usernameValidation.errors.join(', '), 400);
        }
      }

      const updatedUser = await UserModel.update(req.user.userId, {
        email,
        username,
      });

      Logger.info('User profile updated', { userId: req.user.userId });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
