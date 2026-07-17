import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import authRouter from './routes/auth.routes';
import roomRouter from './routes/room.routes';
import rentalRouter from './routes/rental.routes';
import userRouter from './routes/user.routes';
import adminRouter from './routes/admin.routes';
import { AppError } from './utils/errors';

const app = express();

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security Middlewares
app.use(helmet());

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) return callback(null, true);

    const sanitizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin matches localhost, vercel.app, or explicitly configured FRONTEND_URL
    const isLocalhost = sanitizedOrigin.startsWith('http://localhost:') || sanitizedOrigin.startsWith('http://127.0.0.1:');
    const isVercel = sanitizedOrigin.endsWith('.vercel.app');
    
    let isConfigured = false;
    if (process.env.FRONTEND_URL) {
      isConfigured = sanitizedOrigin === process.env.FRONTEND_URL.replace(/\/$/, '');
    }

    if (isLocalhost || isVercel || isConfigured) {
      callback(null, true);
    } else {
      // Disallow origin without throwing an error (to prevent 500 crash)
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Body parser with payload limit (10kb for JSON requests to prevent DOS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Custom NoSQL Query Injection Sanitizer
const sanitizeData = (obj: any): any => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else {
        sanitizeData(obj[key]);
      }
    }
  }
  return obj;
};

const nosqlSanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) sanitizeData(req.body);
  if (req.query) sanitizeData(req.query);
  if (req.params) sanitizeData(req.params);
  next();
};
app.use(nosqlSanitizer);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to iSinhvien API',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/rooms', roomRouter);
app.use('/api/v1/rental-requests', rentalRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin/dashboard', adminRouter);

// Centralized custom error classes

// 404 Route handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized error handler middleware
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let status = 'error';
  let message = 'Internal Server Error';

  if (err instanceof AppError || (err && typeof (err as any).statusCode === 'number')) {
    statusCode = (err as any).statusCode;
    status = (err as any).status || 'error';
    message = err.message;
  }

  // Response structure: exclude stack trace in production and hide sensitive details
  const response: { status: string; message: string; stack?: string } = {
    status,
    message
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    console.error('DEBUG ERROR:', err);
  }

  res.status(statusCode).json(response);
});

export default app;
