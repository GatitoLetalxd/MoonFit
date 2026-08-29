import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRATION as any,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as JwtPayload;
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRATION_DAYS);
  return expiresAt;
}
