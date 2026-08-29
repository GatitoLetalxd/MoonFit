import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import {
  signAccessToken,
  generateRefreshTokenString,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from '../../utils/jwt';
import { Role } from '@prisma/client';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    age?: number;
    height_cm?: number;
    initial_weight_kg?: number;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        role: Role.USER,
        age: data.age,
        height_cm: data.height_cm,
        initial_weight_kg: data.initial_weight_kg,
        onboarding_completed: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        height_cm: true,
        initial_weight_kg: true,
        onboarding_completed: true,
        created_at: true,
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    return {
      user,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Credenciales incorrectas');
    }

    if (!user.active) {
      throw new Error('Tu cuenta se encuentra inactiva. Contacta al administrador.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Credenciales incorrectas');
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const rawRefreshToken = generateRefreshTokenString();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        height_cm: user.height_cm,
        initial_weight_kg: user.initial_weight_kg,
        onboarding_completed: user.onboarding_completed,
        created_at: user.created_at,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async refreshTokens(rawRefreshToken: string) {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findFirst({
      where: { token_hash: tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Token de refresco inválido o no encontrado');
    }

    // Token Reuse Detection: If a revoked token is presented, revoke ALL tokens for this user
    if (storedToken.revoked) {
      await prisma.refreshToken.updateMany({
        where: { user_id: storedToken.user_id },
        data: { revoked: true },
      });
      throw new Error('Violación de seguridad detectada: sesión comprometida. Inicia sesión nuevamente.');
    }

    if (new Date() > storedToken.expires_at) {
      throw new Error('El token de refresco ha expirado');
    }

    if (!storedToken.user.active) {
      throw new Error('Usuario inactivo');
    }

    // Rotate: Revoke the used refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Issue new pair
    const newAccessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    const newRawRefreshToken = generateRefreshTokenString();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const newExpiresAt = getRefreshTokenExpiry();

    await prisma.refreshToken.create({
      data: {
        user_id: storedToken.user.id,
        token_hash: newTokenHash,
        expires_at: newExpiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
    };
  }

  async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { user_id: userId, token_hash: tokenHash },
        data: { revoked: true },
      });
    } else {
      // Revoke all active sessions for this user
      await prisma.refreshToken.updateMany({
        where: { user_id: userId, revoked: false },
        data: { revoked: true },
      });
    }
    return true;
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        height_cm: true,
        initial_weight_kg: true,
        active: true,
        onboarding_completed: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }
}

export const authService = new AuthService();
