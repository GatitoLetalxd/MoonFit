import { prisma } from '../../config/db';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { env } from '../../config/env';

export class UsersService {
  async getProfile(userId: string) {
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
        avatar_url: true,
        onboarding_completed: true,
        created_at: true,
      } as any,
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async uploadAvatar(userId: string, tempFilePath: string) {
    const avatarDir = path.join(env.resolvedStoragePath, 'avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }

    // Eliminar avatar anterior del usuario si existe
    const existingFiles = fs.readdirSync(avatarDir);
    for (const f of existingFiles) {
      if (f.startsWith(`${userId}_avatar`)) {
        try {
          fs.unlinkSync(path.join(avatarDir, f));
        } catch (e) {
          console.error('Error limpiando avatar previo:', e);
        }
      }
    }

    const filename = `${userId}_avatar_${Date.now()}.webp`;
    const finalPath = path.join(avatarDir, filename);

    // Compresión equilibrada: Redimensionado a 400x400, formato WebP a calidad 80
    await sharp(tempFilePath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toFile(finalPath);

    // Limpiar archivo temporal subido por multer
    if (tempFilePath !== finalPath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {}
    }

    const avatarUrl = `/api/users/${userId}/avatar`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: avatarUrl } as any,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        height_cm: true,
        initial_weight_kg: true,
        avatar_url: true,
        onboarding_completed: true,
        created_at: true,
      } as any,
    });

    return updatedUser;
  }

  async getAvatarPath(userId: string) {
    const avatarDir = path.join(env.resolvedStoragePath, 'avatars');
    if (!fs.existsSync(avatarDir)) return null;

    const files = fs.readdirSync(avatarDir);
    const userAvatar = files.find((f) => f.startsWith(`${userId}_avatar`));
    if (!userAvatar) return null;

    const fullPath = path.join(avatarDir, userAvatar);
    if (fs.existsSync(fullPath)) return fullPath;
    return null;
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      age?: number;
      height_cm?: number;
      initial_weight_kg?: number;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        age: data.age,
        height_cm: data.height_cm,
        initial_weight_kg: data.initial_weight_kg,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        height_cm: true,
        initial_weight_kg: true,
        avatar_url: true,
        onboarding_completed: true,
      } as any,
    });
    return user;
  }

  async completeOnboarding(
    userId: string,
    data: {
      age?: number;
      height_cm?: number;
      initial_weight_kg?: number;
      target_weight_kg?: number;
      target_date?: string;
      reminder_time?: string;
      reminder_type?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update basic profile info
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          age: data.age,
          height_cm: data.height_cm,
          initial_weight_kg: data.initial_weight_kg,
          onboarding_completed: true,
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
        },
      });

      // 2. Create Goal if target weight is provided
      if (data.target_weight_kg && data.target_date) {
        await tx.goal.create({
          data: {
            user_id: userId,
            target_weight_kg: data.target_weight_kg,
            target_date: new Date(data.target_date),
            status: 'ACTIVA',
          },
        });
      }

      // 3. Create initial Reminder if provided
      if (data.reminder_time && data.reminder_type) {
        await tx.reminder.create({
          data: {
            user_id: userId,
            type: data.reminder_type,
            time: data.reminder_time,
            frequency: 'diario',
            active: true,
          },
        });
      }

      return user;
    });
  }

  async deleteAccount(userId: string) {
    // 1. Find all physical files to delete
    const progressPhotos = await prisma.progressPhoto.findMany({
      where: { user_id: userId },
      select: { storage_path: true },
    });

    const mealPhotos = await prisma.mealPhoto.findMany({
      where: {
        meal: { user_id: userId },
      },
      select: { storage_path: true },
    });

    // 2. Remove files from disk safely
    const allFiles = [...progressPhotos, ...mealPhotos];
    for (const item of allFiles) {
      try {
        const fullPath = path.resolve(env.resolvedStoragePath, item.storage_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error(`Error deleting file ${item.storage_path}:`, err);
      }
    }

    // 3. Delete user in DB (Cascade will remove all dependent records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return true;
  }
}

export const usersService = new UsersService();
