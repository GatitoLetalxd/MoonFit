import { Request, Response, NextFunction } from 'express';
import { progressService } from './progress.service';
import { sendSuccess, sendError } from '../../utils/response';

export class ProgressController {
  async logWeight(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { weight_kg, notes, date } = req.body;
      if (!weight_kg) {
        sendError(res, 'El weight_kg es requerido', 400);
        return;
      }
      const log = await progressService.logWeeklyWeight(req.user!.id, {
        weight_kg: Number(weight_kg),
        notes,
        date,
      });
      sendSuccess(res, log, 'Peso semanal registrado exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getWeightHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await progressService.getWeeklyWeightHistory(req.user!.id);
      sendSuccess(res, history, 'Historial de peso semanal obtenido');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async logMeasurements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { waist_cm, arm_cm, other_json, date } = req.body;
      const log = await progressService.logBodyMeasurements(req.user!.id, {
        waist_cm: waist_cm ? Number(waist_cm) : undefined,
        arm_cm: arm_cm ? Number(arm_cm) : undefined,
        other_json,
        date,
      });
      sendSuccess(res, log, 'Medidas corporales registradas exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getMeasurements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await progressService.getMeasurementsHistory(req.user!.id);
      sendSuccess(res, history, 'Historial de medidas obtenido');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No se ha subido ningún archivo de imagen', 400);
        return;
      }

      const { taken_at } = req.body;
      const photo = await progressService.saveProgressPhoto(
        req.user!.id,
        req.file.filename,
        taken_at
      );

      sendSuccess(res, photo, 'Foto de progreso subida exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async listPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const photos = await progressService.listProgressPhotos(req.user!.id);
      sendSuccess(res, photos, 'Fotos de progreso obtenidas');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async viewPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const filePath = await progressService.getProgressPhotoFile(
        id,
        req.user!.id,
        req.user!.role
      );
      res.sendFile(filePath);
    } catch (error: any) {
      sendError(res, error.message, 403);
    }
  }

  async deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await progressService.deleteProgressPhoto(id, req.user!.id, req.user!.role);
      sendSuccess(res, null, 'Foto de progreso eliminada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const progressController = new ProgressController();
