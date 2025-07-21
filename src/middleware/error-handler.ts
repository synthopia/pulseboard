import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: AppError | ZodError | Error,
  _req: Request,
  res: Response
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
  }
  // Handle custom app errors
  else if (err instanceof Error && 'statusCode' in err) {
    statusCode = err.statusCode || 500;
    message = err.message;
  }
  // Handle standard errors
  else if (err instanceof Error) {
    message = err.message;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
