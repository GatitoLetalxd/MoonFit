import { Request, Response, NextFunction } from 'express';
import { nutritionService } from './nutrition.service';
import { sendSuccess, sendError } from '../../utils/response';

export class NutritionController {
  async logMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description, meal_type, logged_at } = req.body;
      const photoFilename = req.file ? req.file.filename : undefined;

      const meal = await nutritionService.logMeal(req.user!.id, {
        description,
        meal_type,
        photoFilename,
        logged_at,
      });

      sendSuccess(res, meal, 'Comida registrada exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async listMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const meals = await nutritionService.listMeals(req.user!.id, limit);
      sendSuccess(res, meals, 'Historial de comidas obtenido');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async viewMealPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const filePath = await nutritionService.getMealPhotoFile(
        id,
        req.user!.id,
        req.user!.role
      );
      res.sendFile(filePath);
    } catch (error: any) {
      sendError(res, error.message, 403);
    }
  }

  async deleteMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mealId = parseInt(String(req.params.id), 10);
      await nutritionService.deleteMeal(mealId, req.user!.id, req.user!.role);
      sendSuccess(res, null, 'Comida eliminada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async logWater(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount_ml, logged_at } = req.body;
      if (!amount_ml || Number(amount_ml) <= 0) {
        sendError(res, 'La cantidad en ml debe ser mayor a 0', 400);
        return;
      }

      const log = await nutritionService.logWater(
        req.user!.id,
        Number(amount_ml),
        logged_at
      );

      sendSuccess(res, log, 'Consumo de agua registrado exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getWaterHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const date = req.query.date as string | undefined;
      const result = await nutritionService.getWaterHistory(req.user!.id, date);
      sendSuccess(res, result, 'Registro de agua diario obtenido');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getReferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refs = nutritionService.getReferences();
      sendSuccess(res, refs, 'Referencias informativas nutricionales');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const nutritionController = new NutritionController();
