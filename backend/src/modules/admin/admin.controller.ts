import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendError } from '../../utils/response';

export class AdminController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;
      const role = req.query.role as 'USER' | 'ADMIN' | undefined;

      const result = await adminService.listUsers({ page, limit, search, role });
      sendSuccess(res, result, 'Lista de usuarios obtenida');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async getUserDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const user = await adminService.getUserDetail(id);
      sendSuccess(res, user, 'Detalle de usuario obtenido');
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { active } = req.body;
      const result = await adminService.toggleUserStatus(id, Boolean(active));
      sendSuccess(res, result, `Estado de usuario actualizado a ${active ? 'activo' : 'inactivo'}`);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { password } = req.body;
      const result = await adminService.changeUserPassword(id, password);
      sendSuccess(res, result, 'Contraseña cambiada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async assignRoutine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { routine_id } = req.body;
      const adminId = req.user!.id;
      const assignment = await adminService.assignRoutine(adminId, id, Number(routine_id));
      sendSuccess(res, assignment, 'Rutina asignada exitosamente');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async sendFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { message } = req.body;
      const adminId = req.user!.id;
      const feedback = await adminService.sendFeedback(adminId, id, message);
      sendSuccess(res, feedback, 'Feedback enviado exitosamente', 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await adminService.deleteUser(id);
      sendSuccess(res, null, 'Usuario y todos sus datos eliminados permanentemente');
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  }
}

export const adminController = new AdminController();
