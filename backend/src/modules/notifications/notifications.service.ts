import { prisma } from '../../config/db';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  channelId?: string;
  categoryId?: string;
}

export class NotificationsService {
  /**
   * Guarda o actualiza el token de notificaciones push de Expo del usuario
   */
  async savePushToken(userId: string, token: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { expo_push_token: token },
      select: { id: true, email: true, expo_push_token: true },
    });
  }

  /**
   * Actualiza preferencias de tono y estilo motivacional
   */
  async updatePreferences(userId: string, data: { motivation_tone?: string }) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.motivation_tone ? { motivation_tone: data.motivation_tone } : {}),
      },
      select: { id: true, motivation_tone: true },
    });
  }

  /**
   * Envía una notificación push a través de los servidores de Expo Push API usando fetch nativo
   */
  async sendExpoPush(token: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      if (!token || !token.startsWith('ExponentPushToken')) {
        console.log('Token de notificación no válido:', token);
        return false;
      }

      const message = {
        to: token,
        sound: payload.sound || 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        channelId: payload.channelId || 'moonfit_workouts_v2',
        _categoryId: payload.categoryId,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      console.log('Respuesta de Expo Push:', data);
      return true;
    } catch (error: any) {
      console.warn('Error enviando push notification:', error?.message || error);
      return false;
    }
  }

  /**
   * Envía una notificación push dirigida a un usuario específico si tiene token registrado
   */
  async notifyUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expo_push_token: true, name: true },
    });

    if (!user || !user.expo_push_token) {
      return false;
    }

    return await this.sendExpoPush(user.expo_push_token, payload);
  }
}

export const notificationsService = new NotificationsService();
