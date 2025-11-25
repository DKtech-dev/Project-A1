import jwt, { SignOptions } from 'jsonwebtoken';
import { CustomError } from '../middleware/errorHandler';

export interface JWTPayload {
  userId: number;
  email: string;
}

export class JWTUtils {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return secret;
  }

  private static getExpiresIn(): string | number {
    return process.env.JWT_EXPIRES_IN || '24h';
  }

  static generateToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: this.getExpiresIn() as any,
    };
    return jwt.sign(payload, this.getSecret(), options);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.getSecret()) as JWTPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new CustomError('Token has expired', 401);
      } else if (error.name === 'JsonWebTokenError') {
        throw new CustomError('Invalid token', 401);
      }
      throw new CustomError('Token verification failed', 401);
    }
  }

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
