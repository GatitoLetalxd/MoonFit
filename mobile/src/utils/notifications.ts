import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const initNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('moonfit-reminders', {
      name: 'Recordatorios MoonFit',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#06B6D4',
      sound: undefined,
      enableVibrate: true,
      showBadge: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/**
 * Cancela las notificaciones previamente programadas para una categoría específica
 * para no acumular alertas duplicadas.
 */
export const cancelNotificationByCategory = async (category: string) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.category === category) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (e) {
    console.warn('Error cancelando notificaciones anteriores:', e);
  }
};

/**
 * Programa una alarma o recordatorio local con sonido y prioridad máxima.
 * Soporta repetición diaria (entrenamiento, agua) y repetición semanal (pesaje semanal con día específico).
 */
export const scheduleLocalReminder = async (
  type: string,
  timeStr: string,
  options?: {
    weekday?: number; // 1=Domingo, 2=Lunes, 3=Martes, 4=Miércoles, 5=Jueves, 6=Viernes, 7=Sábado
    frequency?: string;
  }
) => {
  try {
    const hasPermission = await initNotifications();
    if (!hasPermission) return false;

    // Cancelar alarmas anteriores de este mismo tipo para evitar duplicidad
    await cancelNotificationByCategory(type);

    const [hours, minutes] = timeStr.split(':').map(Number);
    const validHours = isNaN(hours) ? 8 : Math.max(0, Math.min(23, hours));
    const validMinutes = isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));

    let title = '🌙 Recordatorio MoonFit';
    let body = '¡Es momento de cuidar tus hábitos y mantenerte en movimiento!';

    if (type === 'entrenar') {
      title = '🔥 ¡Momento de tu Rutina!';
      body = 'Dedica 20 minutos hoy a tu cuerpo desde casa. ¡Tú puedes!';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: { category: type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: validHours,
          minute: validMinutes,
          channelId: 'moonfit-reminders',
        },
      });
    } else if (type === 'agua') {
      title = '💧 Hora de Hidratarte';
      body = 'Toma un vaso de agua para mantener tu metabolismo activo y acelerar tu recuperación.';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: { category: type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: validHours,
          minute: validMinutes,
          channelId: 'moonfit-reminders',
        },
      });
    } else if (type === 'pesarse') {
      title = '⚖️ Registro Semanal de Peso';
      body = 'Hoy toca tu pesaje semanal. ¡Súbete a la báscula y actualiza tu gráfica de evolución!';

      // Weekday en expo-notifications: 1 = Domingo, 2 = Lunes, ..., 7 = Sábado
      const targetWeekday = options?.weekday || 1; // Default Domingo

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: { category: type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: targetWeekday,
          hour: validHours,
          minute: validMinutes,
          channelId: 'moonfit-reminders',
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error programando notificación local:', error);
    return false;
  }
};
