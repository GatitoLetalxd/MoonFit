import { Request, Response, NextFunction } from 'express';
import { goalsService } from './goals.service';
import { sendSuccess, sendError } from '../../utils/response';

export class GoalsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { target_weight_kg, target_date, status } = req.body;
      if (!target_weight_kg || !target_date) {
        sendError(res, 'target_weight_kg y target_date son requeridos', 400);
        return;
      }
      const goal = await goalsService.createGoal(req.user!.id, {
        target_weight_kg: Number(target_weight_kg),
        target_date,
        status,
      });
      sendSuccess(res, goal, 'Meta creada exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goals = await goalsService.getGoals(req.user!.id);
      sendSuccess(res, goals, 'Metas obtenidas');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goalId = parseInt(String(req.params.id), 10);
      const goal = await goalsService.updateGoal(req.user!.id, goalId, req.body);
      sendSuccess(res, goal, 'Meta actualizada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goalId = parseInt(String(req.params.id), 10);
      await goalsService.deleteGoal(req.user!.id, goalId);
      sendSuccess(res, null, 'Meta eliminada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const goalsController = new GoalsController();
