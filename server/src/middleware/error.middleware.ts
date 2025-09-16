import { Request, Response, NextFunction } from 'express';

export class ErrorHandler extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const ErrorHandler = (
  err: Error | ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 (Internal Server Error) if status code is not set
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Something went wrong';
  
  // Log the error for debugging
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
  console.error(err.stack);
  
  // Don't leak stack traces in production
  const response: any = {
    success: false,
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    response.statusCode = 400;
    response.message = 'Validation Error';
    response.errors = (err as any).errors;
  }
  
  if (err.name === 'JsonWebTokenError') {
    response.statusCode = 401;
    response.message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    response.statusCode = 401;
    response.message = 'Token expired';
  }
  
  // Send the error response
  res.status(statusCode).json(response);
};

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
