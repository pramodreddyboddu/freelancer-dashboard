import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized - No token provided', 401, 'auth/no-token');
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
      };
      next();
    } catch (error) {
      throw new AppError('Unauthorized - Invalid token', 401, 'auth/invalid-token');
    }
  } catch (error) {
    next(error);
  }
};
