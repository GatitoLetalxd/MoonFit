import { Request, Response, NextFunction } from 'express';
import { workoutsService } from './workouts.service';
import { sendSuccess, sendError } from '../../utils/response';

export class WorkoutsController {
  async log(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        routine_id,
        status,
        duration_seconds,
        exercises_completed,
        total_exercises,
        completed_at,
      } = req.body;
      if (!routine_id) {
        sendError(res, 'El routine_id es requerido', 400);
        return;
      }
      const log = await workoutsService.logWorkout({
        userId: req.user!.id,
        routineId: Number(routine_id),
        status,
        duration_seconds: duration_seconds !== undefined ? Number(duration_seconds) : undefined,
        exercises_completed: exercises_completed !== undefined ? Number(exercises_completed) : undefined,
        total_exercises: total_exercises !== undefined ? Number(total_exercises) : undefined,
        completedAt: completed_at,
      });
      sendSuccess(res, log, 'Entrenamiento registrado exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const history = await workoutsService.getHistory(req.user!.id, limit);
      sendSuccess(res, history, 'Historial de entrenamientos obtenido');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const workoutsController = new WorkoutsController();
