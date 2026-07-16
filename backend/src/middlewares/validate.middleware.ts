import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError || (error && error.name === 'ZodError')) {
        const errorMessages = error.errors ? error.errors.map((err: any) => err.message).join(', ') : error.message;
        next(new AppError(errorMessages, 400));
      } else {
        next(error);
      }
    }
  };
};
