import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../config/db';
import { sendError } from '../utils/response';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
  active: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    sendError(res, 'Token de autenticación no proporcionado', 401);
    return;
  }

  try {
    const payload: JwtPayload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, active: true },
    });

    if (!user) {
      sendError(res, 'Usuario no encontrado', 401);
      return;
    }

    if (!user.active) {
      sendError(res, 'Tu cuenta se encuentra inactiva. Contacta al administrador.', 403);
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'El token ha expirado', 401, { code: 'TOKEN_EXPIRED' });
      return;
    }
    sendError(res, 'Token de autenticación inválido', 401);
    return;
  }
}
