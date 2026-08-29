import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db';
import { usersService } from '../users/users.service';

export class AdminService {
  async listUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'USER' | 'ADMIN';
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.role) {
      where.role = options.role;
    }
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          age: true,
          height_cm: true,
          initial_weight_kg: true,
          onboarding_completed: true,
          created_at: true,
          _count: {
            select: {
              weekly_weight_logs: true,
              progress_photos: true,
              workout_logs: true,
              meals: true,
            },
          },
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        age: true,
        height_cm: true,
        initial_weight_kg: true,
        onboarding_completed: true,
        created_at: true,
        goals: {
          orderBy: { created_at: 'desc' },
        },
        weekly_weight_logs: {
          orderBy: { week_start_date: 'asc' },
        },
        body_measurements: {
          orderBy: { week_start_date: 'asc' },
        },
        progress_photos: {
          orderBy: { taken_at: 'desc' },
          select: {
            id: true,
            taken_at: true,
            created_at: true,
          },
        },
        assigned_routines: {
          include: {
            routine: {
              include: {
                exercises: {
                  orderBy: { order_index: 'asc' },
                },
              },
            },
          },
        },
        workout_logs: {
          orderBy: { completed_at: 'desc' },
          take: 50,
          include: {
            routine: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        meals: {
          orderBy: { logged_at: 'desc' },
          take: 20,
          include: {
            photos: {
              select: { id: true, created_at: true },
            },
          },
        },
        reminders: {
          orderBy: { created_at: 'asc' },
        },
        received_feedback: {
          orderBy: { created_at: 'desc' },
          include: {
            admin: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async toggleUserStatus(userId: string, active: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { active },
      select: { id: true, email: true, active: true },
    });

    // If deactivated, revoke all active sessions
    if (!active) {
      await prisma.refreshToken.updateMany({
        where: { user_id: userId, revoked: false },
        data: { revoked: true },
      });
    }

    return user;
  }

  async changeUserPassword(userId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });

    // Revoke all sessions for this user so they must log in with new password
    await prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked: false },
      data: { revoked: true },
    });

    return { message: 'Contraseña actualizada y sesiones anteriores revocadas' };
  }

  async assignRoutine(adminId: string, userId: string, routineId: number) {
    // Check user & routine
    const [user, routine] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.routine.findUnique({ where: { id: routineId } }),
    ]);

    if (!user) throw new Error('Usuario no encontrado');
    if (!routine) throw new Error('Rutina no encontrada');

    const assignment = await prisma.routineAssignment.create({
      data: {
        user_id: userId,
        routine_id: routineId,
        assigned_by: adminId,
      },
      include: {
        routine: true,
      },
    });

    return assignment;
  }

  async sendFeedback(adminId: string, userId: string, message: string) {
    if (!message || message.trim() === '') {
      throw new Error('El mensaje no puede estar vacío');
    }

    const feedback = await prisma.adminFeedback.create({
      data: {
        admin_id: adminId,
        user_id: userId,
        message,
      },
      include: {
        admin: {
          select: { id: true, name: true },
        },
      },
    });

    return feedback;
  }

  async deleteUser(userId: string) {
    return await usersService.deleteAccount(userId);
  }
}

export const adminService = new AdminService();
