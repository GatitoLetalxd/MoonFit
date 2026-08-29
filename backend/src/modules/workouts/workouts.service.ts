import { prisma } from '../../config/db';

export class WorkoutsService {
  async logWorkout(data: {
    userId: string;
    routineId: number;
    status?: string;
    duration_seconds?: number;
    exercises_completed?: number;
    total_exercises?: number;
    completedAt?: string;
  }) {
    const routine = await prisma.routine.findUnique({
      where: { id: data.routineId },
    });

    if (!routine) {
      throw new Error('Rutina no encontrada');
    }

    const log = await prisma.workoutLog.create({
      data: {
        user_id: data.userId,
        routine_id: data.routineId,
        status: data.status || 'COMPLETADA',
        duration_seconds: data.duration_seconds !== undefined ? data.duration_seconds : null,
        exercises_completed: data.exercises_completed !== undefined ? data.exercises_completed : null,
        total_exercises: data.total_exercises !== undefined ? data.total_exercises : null,
        completed_at: data.completedAt ? new Date(data.completedAt) : new Date(),
      },
      include: {
        routine: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return log;
  }

  async getHistory(userId: string, limit: number = 50) {
    const history = await prisma.workoutLog.findMany({
      where: { user_id: userId },
      orderBy: { completed_at: 'desc' },
      take: limit,
      include: {
        routine: {
          select: {
            id: true,
            name: true,
            type: true,
            exercises: {
              orderBy: { order_index: 'asc' },
            },
          },
        },
      },
    });

    return history;
  }
}

export const workoutsService = new WorkoutsService();
