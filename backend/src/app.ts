import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/error.middleware';
import { sendError, sendSuccess } from './utils/response';

// Routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import adminRoutes from './modules/admin/admin.routes';
import routinesRoutes from './modules/routines/routines.routes';
import workoutsRoutes from './modules/workouts/workouts.routes';
import progressRoutes from './modules/progress/progress.routes';
import nutritionRoutes from './modules/nutrition/nutrition.routes';
import goalsRoutes from './modules/goals/goals.routes';
import remindersRoutes from './modules/reminders/reminders.routes';

export const app: Express = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: '*', // Configurable for specific domains in production if required
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  }, 'MoonFit API is running smoothly');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/routines', routinesRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/reminders', remindersRoutes);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  sendError(res, 'Ruta no encontrada en la API', 404);
});

// Global Error Handler
app.use(errorHandler);
