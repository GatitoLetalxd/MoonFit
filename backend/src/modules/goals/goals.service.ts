import { prisma } from '../../config/db';
import { GoalStatus } from '@prisma/client';

export class GoalsService {
  async createGoal(
    userId: string,
    data: {
      target_weight_kg: number;
      target_date: string;
      status?: GoalStatus;
    }
  ) {
    return await prisma.goal.create({
      data: {
        user_id: userId,
        target_weight_kg: data.target_weight_kg,
        target_date: new Date(data.target_date),
        status: data.status || GoalStatus.ACTIVA,
      },
    });
  }

  async getGoals(userId: string) {
    const [user, goals, latestWeightLog] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { initial_weight_kg: true },
      }),
      prisma.goal.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      }),
      prisma.weeklyWeightLog.findFirst({
        where: { user_id: userId },
        orderBy: { week_start_date: 'desc' },
      }),
    ]);

    const initialWeight = user?.initial_weight_kg || null;
    const currentWeight = latestWeightLog?.weight_kg || initialWeight;

    const goalsWithProgress = goals.map((goal) => {
      let progressPercent = 0;
      if (initialWeight && currentWeight && initialWeight !== goal.target_weight_kg) {
        const totalToLoseOrGain = Math.abs(initialWeight - goal.target_weight_kg);
        const achieved = Math.abs(initialWeight - currentWeight);
        progressPercent = Math.min(100, Math.max(0, Math.round((achieved / totalToLoseOrGain) * 100)));
      }

      return {
        ...goal,
        initial_weight_kg: initialWeight,
        current_weight_kg: currentWeight,
        progress_percentage: progressPercent,
      };
    });

    return goalsWithProgress;
  }

  async getActiveGoal(userId: string) {
    const goals = await this.getGoals(userId);
    const active = goals.find((g) => g.status === GoalStatus.ACTIVA) || goals[0] || null;
    return active;
  }

  async updateGoal(
    userId: string,
    goalId: number,
    data: {
      target_weight_kg?: number;
      target_date?: string;
      status?: GoalStatus;
    }
  ) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) throw new Error('Meta no encontrada');
    if (goal.user_id !== userId) throw new Error('No tienes permisos para modificar esta meta');

    return await prisma.goal.update({
      where: { id: goalId },
      data: {
        target_weight_kg: data.target_weight_kg,
        target_date: data.target_date ? new Date(data.target_date) : undefined,
        status: data.status,
      },
    });
  }

  async deleteGoal(userId: string, goalId: number) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) throw new Error('Meta no encontrada');
    if (goal.user_id !== userId) throw new Error('No tienes permisos para eliminar esta meta');

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return true;
  }
}

export const goalsService = new GoalsService();
