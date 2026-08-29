import { prisma } from '../../config/db';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export class NutritionService {
  async logMeal(
    userId: string,
    data: {
      description?: string;
      meal_type?: string;
      photoFilename?: string;
      logged_at?: string;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      const meal = await tx.meal.create({
        data: {
          user_id: userId,
          description: data.description,
          meal_type: data.meal_type,
          logged_at: data.logged_at ? new Date(data.logged_at) : new Date(),
        },
      });

      if (data.photoFilename) {
        await tx.mealPhoto.create({
          data: {
            meal_id: meal.id,
            storage_path: `meals/${data.photoFilename}`,
          },
        });
      }

      return await tx.meal.findUnique({
        where: { id: meal.id },
        include: {
          photos: {
            select: { id: true, created_at: true },
          },
        },
      });
    });
  }

  async listMeals(userId: string, limit: number = 30) {
    return await prisma.meal.findMany({
      where: { user_id: userId },
      orderBy: { logged_at: 'desc' },
      take: limit,
      include: {
        photos: {
          select: { id: true, created_at: true },
        },
      },
    });
  }

  async getMealPhotoFile(
    photoId: string,
    requestingUserId: string,
    requestingUserRole: Role
  ) {
    const photo = await prisma.mealPhoto.findUnique({
      where: { id: photoId },
      include: { meal: true },
    });

    if (!photo) {
      throw new Error('Foto de comida no encontrada');
    }

    if (photo.meal.user_id !== requestingUserId && requestingUserRole !== Role.ADMIN) {
      throw new Error('No tienes autorización para acceder a esta foto');
    }

    const absolutePath = path.resolve(env.resolvedStoragePath, photo.storage_path);
    if (!fs.existsSync(absolutePath)) {
      throw new Error('El archivo físico de la imagen no existe');
    }

    return absolutePath;
  }

  async deleteMeal(mealId: number, userId: string, userRole: Role) {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { photos: true },
    });

    if (!meal) throw new Error('Comida no encontrada');
    if (meal.user_id !== userId && userRole !== Role.ADMIN) {
      throw new Error('No tienes autorización para eliminar este registro');
    }

    // Delete photos physically
    for (const photo of meal.photos) {
      const absolutePath = path.resolve(env.resolvedStoragePath, photo.storage_path);
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (err) {
          console.error('Error deleting meal photo:', err);
        }
      }
    }

    await prisma.meal.delete({
      where: { id: mealId },
    });

    return true;
  }

  async logWater(userId: string, amount_ml: number, logged_at?: string) {
    return await prisma.waterLog.create({
      data: {
        user_id: userId,
        amount_ml,
        logged_at: logged_at ? new Date(logged_at) : new Date(),
      },
    });
  }

  async getWaterHistory(userId: string, dateString?: string) {
    const date = dateString ? new Date(dateString) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.waterLog.findMany({
      where: {
        user_id: userId,
        logged_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { logged_at: 'asc' },
    });

    const total_ml = logs.reduce((sum, log) => sum + log.amount_ml, 0);

    return {
      date: date.toISOString().split('T')[0],
      total_ml,
      reference_ml: 2000,
      logs,
    };
  }

  getReferences() {
    return {
      water: {
        reference_daily_ml: 2200,
        tip: 'Se recomienda consumir entre 2.0 y 2.5 litros de agua al día para mantener una hidratación óptima.',
      },
      protein: {
        tip: 'Recuerda incluir una porción de proteína (pollo, pescado, huevos, legumbres) en cada comida principal.',
      },
      habits: {
        tip: 'El progreso constante se logra construyendo hábitos sostenibles día a día, sin necesidad de conteos obsesivos.',
      },
    };
  }
}

export const nutritionService = new NutritionService();
