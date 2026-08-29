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

export const scheduleLocalReminder = async (type: string, timeStr: string) => {
  try {
    const hasPermission = await initNotifications();
    if (!hasPermission) return false;

    const [hours, minutes] = timeStr.split(':').map(Number);

    let title = '🌙 Recordatorio MoonFit';
    let body = '¡Es momento de cuidar tus hábitos y mantenerte en movimiento!';

    if (type === 'entrenar') {
      title = '🔥 ¡Momento de tu Rutina!';
      body = 'Dedica 20 minutos hoy a tu cuerpo desde casa. ¡Tú puedes!';
    } else if (type === 'agua') {
      title = '💧 Hora de Hidratarte';
      body = 'Toma un vaso de agua para mantener tu metabolismo activo.';
    } else if (type === 'pesarse') {
      title = '⚖️ Registro Semanal de Peso';
      body = 'Registra tu peso de la semana para actualizar tu gráfica de evolución.';
    }

    // Programar notificación diaria repetitiva con sonido por defecto
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: 'moonfit-reminders',
      },
    });

    return true;
  } catch (error) {
    console.error('Error programando notificación local:', error);
    return false;
  }
};

export const sendTestNotificationNow = async () => {
  try {
    const hasPermission = await initNotifications();
    if (!hasPermission) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 ¡Prueba de Notificación MoonFit!',
        body: 'Tu recordatorio diario de entrenamiento está activo con sonido.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: 'moonfit-reminders',
      },
    });

    return true;
  } catch (error) {
    console.error('Error lanzando prueba de notificación:', error);
    return false;
  }
};
