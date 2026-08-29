import { prisma } from '../../config/db';

export class RoutinesService {
  async listRoutines(userId: string) {
    const [predefined, userCreated, assigned] = await Promise.all([
      prisma.routine.findMany({
        where: { is_predefined: true },
        include: {
          exercises: { orderBy: { order_index: 'asc' } },
        },
      }),
      prisma.routine.findMany({
        where: { user_id: userId },
        include: {
          exercises: { orderBy: { order_index: 'asc' } },
        },
      }),
      prisma.routineAssignment.findMany({
        where: { user_id: userId },
        include: {
          routine: {
            include: {
              exercises: { orderBy: { order_index: 'asc' } },
            },
          },
          admin: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    return {
      predefined,
      userCreated,
      assigned: assigned.map((a) => ({
        ...a.routine,
        assigned_by: a.admin ? a.admin.name : 'Administrador',
        assigned_at: a.assigned_at,
      })),
    };
  }

  async getRoutineById(routineId: number) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
      include: {
        exercises: { orderBy: { order_index: 'asc' } },
      },
    });

    if (!routine) {
      throw new Error('Rutina no encontrada');
    }

    return routine;
  }

  async createRoutine(
    userId: string,
    data: {
      name: string;
      type: string;
      exercises: Array<{
        exercise_name: string;
        sets: number;
        reps: number;
        rest_seconds?: number;
        order_index?: number;
      }>;
    }
  ) {
    const routine = await prisma.routine.create({
      data: {
        user_id: userId,
        name: data.name,
        type: data.type,
        is_predefined: false,
        exercises: {
          create: data.exercises.map((e, index) => ({
            exercise_name: e.exercise_name,
            sets: e.sets,
            reps: e.reps,
            rest_seconds: e.rest_seconds || 60,
            order_index: e.order_index ?? index + 1,
          })),
        },
      },
      include: {
        exercises: { orderBy: { order_index: 'asc' } },
      },
    });

    return routine;
  }

  async updateRoutine(
    userId: string,
    routineId: number,
    data: {
      name?: string;
      type?: string;
      exercises?: Array<{
        exercise_name: string;
        sets: number;
        reps: number;
        rest_seconds?: number;
        order_index?: number;
      }>;
    }
  ) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine) throw new Error('Rutina no encontrada');
    if (routine.user_id !== userId) throw new Error('No tienes permisos para modificar esta rutina');

    return await prisma.$transaction(async (tx) => {
      if (data.exercises) {
        // Replace exercises
        await tx.routineExercise.deleteMany({
          where: { routine_id: routineId },
        });

        await tx.routineExercise.createMany({
          data: data.exercises.map((e, index) => ({
            routine_id: routineId,
            exercise_name: e.exercise_name,
            sets: e.sets,
            reps: e.reps,
            rest_seconds: e.rest_seconds || 60,
            order_index: e.order_index ?? index + 1,
          })),
        });
      }

      const updated = await tx.routine.update({
        where: { id: routineId },
        data: {
          name: data.name,
          type: data.type,
        },
        include: {
          exercises: { orderBy: { order_index: 'asc' } },
        },
      });

      return updated;
    });
  }

  async deleteRoutine(userId: string, routineId: number) {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine) throw new Error('Rutina no encontrada');
    if (routine.is_predefined) throw new Error('No se pueden eliminar las rutinas predefinidas del sistema');
    if (routine.user_id !== userId) throw new Error('No tienes permisos para eliminar esta rutina');

    await prisma.routine.delete({
      where: { id: routineId },
    });

    return true;
  }
}

export const routinesService = new RoutinesService();
