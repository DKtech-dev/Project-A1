import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const mockAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Mock authentication for demo purposes
  // In a real application, this would validate JWT tokens or session cookies
  req.user = {
    id: 'demo-user-id',
    username: 'demo_user'
  };
  next();
};