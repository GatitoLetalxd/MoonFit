import { prisma } from '../../config/db';

export class RemindersService {
  async listReminders(userId: string) {
    return await prisma.reminder.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
  }

  async createReminder(
    userId: string,
    data: {
      type: string;
      time: string;
      frequency?: string;
      active?: boolean;
    }
  ) {
    return await prisma.reminder.create({
      data: {
        user_id: userId,
        type: data.type,
        time: data.time,
        frequency: data.frequency || 'diario',
        active: data.active ?? true,
      },
    });
  }

  async updateReminder(
    userId: string,
    reminderId: number,
    data: {
      type?: string;
      time?: string;
      frequency?: string;
      active?: boolean;
    }
  ) {
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) throw new Error('Recordatorio no encontrado');
    if (reminder.user_id !== userId) throw new Error('No tienes permisos para modificar este recordatorio');

    return await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        type: data.type,
        time: data.time,
        frequency: data.frequency,
        active: data.active,
      },
    });
  }

  async deleteReminder(userId: string, reminderId: number) {
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) throw new Error('Recordatorio no encontrado');
    if (reminder.user_id !== userId) throw new Error('No tienes permisos para eliminar este recordatorio');

    await prisma.reminder.delete({
      where: { id: reminderId },
    });

    return true;
  }
}

export const remindersService = new RemindersService();
