import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'Usuario registrado exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Sesión iniciada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      sendSuccess(res, result, 'Tokens actualizados correctamente');
    } catch (error: any) {
      sendError(res, error.message, 401);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { refreshToken } = req.body;
      await authService.logout(userId, refreshToken);
      sendSuccess(res, null, 'Sesión cerrada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.id);
      sendSuccess(res, user, 'Perfil de usuario obtenido');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }
}

export const authController = new AuthController();
