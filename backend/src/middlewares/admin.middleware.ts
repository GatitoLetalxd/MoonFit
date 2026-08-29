import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { Role } from '@prisma/client';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendError(res, 'No autorizado', 401);
    return;
  }

  if (req.user.role !== Role.ADMIN) {
    sendError(res, 'Acceso restringido: Se requieren permisos de administrador', 403);
    return;
  }

  next();
}
