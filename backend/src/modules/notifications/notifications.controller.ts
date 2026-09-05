import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  async registerPushToken(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token de notificación requerido' });
      }

      const updated = await notificationsService.savePushToken(userId, token);
      return res.json({ success: true, user: updated });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error al guardar token push' });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { motivation_tone } = req.body;

      const updated = await notificationsService.updatePreferences(userId, {
        motivation_tone,
      });

      return res.json({ success: true, user: updated });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Error al actualizar preferencias' });
    }
  }
}

export const notificationsController = new NotificationsController();
