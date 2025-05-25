import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number, code: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = 500;
  let errorCode = 'server/internal-error';
  let errorMessage = 'Internal server error';
  let errorDetails = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    errorMessage = err.message;
    errorDetails = err.details;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors
    statusCode = 400;
    errorCode = 'validation/invalid-input';
    errorMessage = err.message;
  } else if (err.name === 'UnauthorizedError') {
    // Handle JWT errors
    statusCode = 401;
    errorCode = 'auth/unauthorized';
    errorMessage = 'Unauthorized access';
  }

  // Construct error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
  };

  if (errorDetails) {
    errorResponse.error.details = errorDetails;
  }

  res.status(statusCode).json(errorResponse);
};
