import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess, sendError } from '../../utils/response';

export class UsersController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await usersService.getProfile(req.user!.id);
      sendSuccess(res, profile, 'Perfil obtenido');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No se ha adjuntado ninguna imagen de avatar', 400);
        return;
      }
      const user = await usersService.uploadAvatar(req.user!.id, req.file.path);
      sendSuccess(res, user, 'Foto de perfil actualizada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async viewAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetUserId = req.params.id || req.user?.id;
      if (!targetUserId) {
        sendError(res, 'ID de usuario no proporcionado', 400);
        return;
      }
      const avatarPath = await usersService.getAvatarPath(String(targetUserId));
      if (!avatarPath) {
        sendError(res, 'Foto de perfil no encontrada', 404);
        return;
      }
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(avatarPath);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await usersService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, updated, 'Perfil actualizado correctamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.completeOnboarding(req.user!.id, req.body);
      sendSuccess(res, user, 'Onboarding completado exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteMyAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.deleteAccount(req.user!.id);
      sendSuccess(res, null, 'Cuenta y todos los datos asociados eliminados permanentemente');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const usersController = new UsersController();
