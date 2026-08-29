import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response';
import multer from 'multer';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'El archivo excede el tamaño máximo permitido (10MB)', 400);
      return;
    }
    sendError(res, `Error en la subida de archivo: ${err.message}`, 400);
    return;
  }

  if (err.message && err.message.includes('Formato de imagen inválido')) {
    sendError(res, err.message, 400);
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  sendError(
    res,
    isProduction ? 'Ocurrió un error interno en el servidor' : err.message,
    err.statusCode || 500,
    isProduction ? null : err.stack
  );
}
