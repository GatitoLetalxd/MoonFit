import { Request, Response, NextFunction } from 'express';
import { routinesService } from './routines.service';
import { sendSuccess, sendError } from '../../utils/response';

export class RoutinesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const routines = await routinesService.listRoutines(req.user!.id);
      sendSuccess(res, routines, 'Rutinas obtenidas');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const routineId = parseInt(String(req.params.id), 10);
      const routine = await routinesService.getRoutineById(routineId);
      sendSuccess(res, routine, 'Detalle de rutina obtenido');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const routine = await routinesService.createRoutine(req.user!.id, req.body);
      sendSuccess(res, routine, 'Rutina creada exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const routineId = parseInt(String(req.params.id), 10);
      const routine = await routinesService.updateRoutine(req.user!.id, routineId, req.body);
      sendSuccess(res, routine, 'Rutina actualizada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const routineId = parseInt(String(req.params.id), 10);
      await routinesService.deleteRoutine(req.user!.id, routineId);
      sendSuccess(res, null, 'Rutina eliminada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const routinesController = new RoutinesController();
