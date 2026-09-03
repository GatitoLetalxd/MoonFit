import { prisma } from '../../config/db';
import { getMondayOfWeek } from '../../utils/date';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export class ProgressService {
  async logWeeklyWeight(
    userId: string,
    data: { weight_kg: number; notes?: string; date?: string }
  ) {
    const monday = getMondayOfWeek(data.date ? new Date(data.date) : new Date());

    const log = await prisma.weeklyWeightLog.upsert({
      where: {
        user_id_week_start_date: {
          user_id: userId,
          week_start_date: monday,
        },
      },
      update: {
        weight_kg: data.weight_kg,
        notes: data.notes,
        logged_at: new Date(),
      },
      create: {
        user_id: userId,
        week_start_date: monday,
        weight_kg: data.weight_kg,
        notes: data.notes,
      },
    });

    return log;
  }

  async getWeeklyWeightHistory(userId: string) {
    return await prisma.weeklyWeightLog.findMany({
      where: { user_id: userId },
      orderBy: { week_start_date: 'asc' },
    });
  }

  async logBodyMeasurements(
    userId: string,
    data: { waist_cm?: number; arm_cm?: number; other_json?: any; date?: string }
  ) {
    const monday = getMondayOfWeek(data.date ? new Date(data.date) : new Date());

    const measurement = await prisma.bodyMeasurement.create({
      data: {
        user_id: userId,
        week_start_date: monday,
        waist_cm: data.waist_cm,
        arm_cm: data.arm_cm,
        other_json: data.other_json,
      },
    });

    return measurement;
  }

  async getMeasurementsHistory(userId: string) {
    return await prisma.bodyMeasurement.findMany({
      where: { user_id: userId },
      orderBy: { week_start_date: 'asc' },
    });
  }

  async saveProgressPhoto(userId: string, rawFilename: string, takenAt?: string) {
    const progressDir = path.join(env.resolvedStoragePath, 'progress');
    if (!fs.existsSync(progressDir)) {
      fs.mkdirSync(progressDir, { recursive: true });
    }

    const rawFilePath = path.join(progressDir, rawFilename);
    const optimizedFilename = `${path.parse(rawFilename).name}_opt.webp`;
    const optimizedFilePath = path.join(progressDir, optimizedFilename);

    let finalStoragePath = `progress/${rawFilename}`;

    if (fs.existsSync(rawFilePath)) {
      try {
        await sharp(rawFilePath)
          .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(optimizedFilePath);

        // Remove raw uploaded file to save disk space
        if (rawFilePath !== optimizedFilePath && fs.existsSync(rawFilePath)) {
          fs.unlinkSync(rawFilePath);
        }
        finalStoragePath = `progress/${optimizedFilename}`;
      } catch (err) {
        console.warn('Error compressing progress photo with sharp, using original:', err);
      }
    }

    const photo = await prisma.progressPhoto.create({
      data: {
        user_id: userId,
        storage_path: finalStoragePath,
        taken_at: takenAt ? new Date(takenAt) : new Date(),
      },
    });

    return photo;
  }

  async listProgressPhotos(userId: string) {
    return await prisma.progressPhoto.findMany({
      where: { user_id: userId },
      orderBy: { taken_at: 'desc' },
    });
  }

  async getProgressPhotoFile(
    photoId: string,
    requestingUserId: string,
    requestingUserRole: Role
  ) {
    const photo = await prisma.progressPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new Error('Foto de progreso no encontrada');
    }

    // Must be the owner or an admin
    if (photo.user_id !== requestingUserId && requestingUserRole !== Role.ADMIN) {
      throw new Error('No tienes autorización para acceder a esta foto');
    }

    const absolutePath = path.resolve(env.resolvedStoragePath, photo.storage_path);
    if (!fs.existsSync(absolutePath)) {
      throw new Error('El archivo físico de la imagen no existe');
    }

    return absolutePath;
  }

  async deleteProgressPhoto(photoId: string, userId: string, userRole: Role) {
    const photo = await prisma.progressPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) throw new Error('Foto no encontrada');
    if (photo.user_id !== userId && userRole !== Role.ADMIN) {
      throw new Error('No tienes autorización para eliminar esta foto');
    }

    // Delete physical file
    const absolutePath = path.resolve(env.resolvedStoragePath, photo.storage_path);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error('Error deleting photo file:', err);
      }
    }

    await prisma.progressPhoto.delete({
      where: { id: photoId },
    });

    return true;
  }
}

export const progressService = new ProgressService();
