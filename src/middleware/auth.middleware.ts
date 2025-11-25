import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
import { JWTUtils, JWTPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new CustomError('No authorization header provided', 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new CustomError('Invalid authorization format. Use Bearer token', 401);
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new CustomError('No token provided', 401);
    }

    const decoded = JWTUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
