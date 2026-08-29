import { Request, Response, NextFunction } from 'express';
import { remindersService } from './reminders.service';
import { sendSuccess, sendError } from '../../utils/response';

export class RemindersController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reminders = await remindersService.listReminders(req.user!.id);
      sendSuccess(res, reminders, 'Configuración de recordatorios obtenida');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, time, frequency, active } = req.body;
      if (!type || !time) {
        sendError(res, 'type y time son requeridos', 400);
        return;
      }
      const reminder = await remindersService.createReminder(req.user!.id, {
        type,
        time,
        frequency,
        active,
      });
      sendSuccess(res, reminder, 'Recordatorio creado exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reminderId = parseInt(String(req.params.id), 10);
      const reminder = await remindersService.updateReminder(req.user!.id, reminderId, req.body);
      sendSuccess(res, reminder, 'Recordatorio actualizado exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reminderId = parseInt(String(req.params.id), 10);
      await remindersService.deleteReminder(req.user!.id, reminderId);
      sendSuccess(res, null, 'Recordatorio eliminado exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }
}

export const remindersController = new RemindersController();
