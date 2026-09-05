import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { offlineStorage, DEFAULT_OFFLINE_ROUTINES } from './offlineStorage';
import { smartNotificationEngine } from '../services/smartNotificationEngine';
import { navigate } from '../navigation/navigationRef';

// ==================== IDENTIFICADORES DE CATEGORÍAS ====================
export const NOTIFICATION_CATEGORIES = {
  WATER: 'moonfit_water_cat_v2',
  WORKOUT: 'moonfit_workout_cat_v2',
  WEIGHT: 'moonfit_weight_cat_v2',
  STREAK: 'moonfit_streak_cat_v2',
  COACH: 'moonfit_coach_cat_v2',
};

// ==================== IDENTIFICADORES DETERMINÍSTICOS (Anti-Duplicación) ====================
// Usar IDs fijos garantiza que scheduleNotificationAsync REEMPLAZA la anterior
// en vez de crear una nueva entrada en el AlarmManager de Android.
export const NOTIFICATION_IDENTIFIERS = {
  REMINDER_ENTRENAR: 'moonfit_reminder_entrenar',
  REMINDER_AGUA: 'moonfit_reminder_agua',
  REMINDER_PESARSE: 'moonfit_reminder_pesarse',
};

// ==================== IDENTIFICADORES DE ACCIONES ====================
export const NOTIFICATION_ACTIONS = {
  // Agua
  ADD_WATER_250: 'ADD_WATER_250',
  ADD_WATER_500: 'ADD_WATER_500',
  SNOOZE_WATER_1H: 'SNOOZE_WATER_1H',

  // Rutina
  START_WORKOUT: 'START_WORKOUT',
  EXPRESS_WORKOUT: 'EXPRESS_WORKOUT',
  SNOOZE_WORKOUT_30M: 'SNOOZE_WORKOUT_30M',
  REST_DAY: 'REST_DAY',

  // Peso
  OPEN_WEIGHT_LOG: 'OPEN_WEIGHT_LOG',
  REMIND_WEIGHT_TOMORROW: 'REMIND_WEIGHT_TOMORROW',

  // Racha
  RESCUE_STREAK: 'RESCUE_STREAK',
  REST_SHIELD: 'REST_SHIELD',

  // Coach
  VIEW_FEEDBACK: 'VIEW_FEEDBACK',
  ACK_FEEDBACK: 'ACK_FEEDBACK',
};

// ==================== CANALES DE NOTIFICACIÓN ANDROID ====================
export const NOTIFICATION_CHANNELS = {
  WORKOUT: 'moonfit_workouts_v2',
  WATER: 'moonfit_water_v2',
  WEIGHT: 'moonfit_weight_v2',
  STREAK: 'moonfit_streak_v2',
  COACH: 'moonfit_coach_v2',
};

// Rutina express de emergencia (7 minutos para salvar racha)
const EXPRESS_ROUTINE = {
  id: 999,
  name: '⚡ Rutina Express (7 min): Salva-Racha',
  type: 'HIIT',
  is_predefined: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  exercises: [
    { id: 9991, routine_id: 999, exercise_name: 'Saltos en Tijera (Jumping Jacks)', sets: 3, reps: 40, rest_seconds: 20, order_index: 1 },
    { id: 9992, routine_id: 999, exercise_name: 'Sentadillas Dinámicas', sets: 3, reps: 15, rest_seconds: 20, order_index: 2 },
    { id: 9993, routine_id: 999, exercise_name: 'Plancha Frontal Isométrica', sets: 3, reps: 35, rest_seconds: 20, order_index: 3 },
  ],
};

// Configuración general del comportamiento de notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Singleton guard para evitar re-inicialización redundante de canales/categorías
let _notificationsInitialized = false;

/**
 * Inicializa permisos, categorías interactivas y canales nativos de Android.
 * Usa un singleton guard para evitar re-crear canales en cada scheduleLocalReminder.
 */
export const initNotifications = async (): Promise<boolean> => {
  // Si ya se inicializó, solo verificar permisos
  if (_notificationsInitialized) {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }
  try {
    // 1. Configuración de Canales Nativos en Android con Sonidos y Vibraciones Diferenciadas
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.WORKOUT, {
        name: '🔥 Entrenamiento y Rutinas',
        description: 'Alertas de tu sesión de entrenamiento diaria con sonido enérgico',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500, 200, 500],
        lightColor: '#06B6D4',
        sound: 'moonfit_workout',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.WATER, {
        name: '💧 Hidratación Inteligente',
        description: 'Recordatorios para beber agua con sonido sutil de gota',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#3B82F6',
        sound: 'moonfit_water',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.WEIGHT, {
        name: '⚖️ Pesaje Semanal y Evolución',
        description: 'Recordatorios semanales de pesaje con sonido de campana zen',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: '#10B981',
        sound: 'moonfit_bell',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.STREAK, {
        name: '🚨 Alertas de Racha SOS',
        description: 'Avisos nocturnos si tu racha invicta está en riesgo',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 300, 100, 300, 100, 300],
        lightColor: '#EF4444',
        sound: 'moonfit_workout',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.COACH, {
        name: '🏋️‍♂️ Mensajes del Coach',
        description: 'Notas técnicas y ajustes de tu entrenador personal',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 600, 150, 600],
        lightColor: '#F59E0B',
        sound: 'moonfit_bell',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    // 2. Registro de Categorías Interactivas con Botones de Acción
    await Promise.all([
      // Categoría: AGUA (Background actions: sin abrir la app)
      Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.WATER, [
        {
          identifier: NOTIFICATION_ACTIONS.ADD_WATER_250,
          buttonTitle: '💧 +250 ml',
          options: { opensAppToForeground: false },
        },
        {
          identifier: NOTIFICATION_ACTIONS.ADD_WATER_500,
          buttonTitle: '🥤 +500 ml',
          options: { opensAppToForeground: false },
        },
        {
          identifier: NOTIFICATION_ACTIONS.SNOOZE_WATER_1H,
          buttonTitle: '⏳ Posponer 1h',
          options: { opensAppToForeground: false },
        },
      ]),

      // Categoría: ENTRENAMIENTO (Deep links directos)
      Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.WORKOUT, [
        {
          identifier: NOTIFICATION_ACTIONS.START_WORKOUT,
          buttonTitle: '🚀 Iniciar Rutina',
          options: { opensAppToForeground: true },
        },
        {
          identifier: NOTIFICATION_ACTIONS.EXPRESS_WORKOUT,
          buttonTitle: '⚡ Express (7m)',
          options: { opensAppToForeground: true },
        },
        {
          identifier: NOTIFICATION_ACTIONS.SNOOZE_WORKOUT_30M,
          buttonTitle: '⏰ Posponer 30m',
          options: { opensAppToForeground: false },
        },
        {
          identifier: NOTIFICATION_ACTIONS.REST_DAY,
          buttonTitle: '💤 Descanso Hoy',
          options: { opensAppToForeground: false },
        },
      ]),

      // Categoría: PESAJE SEMANAL
      Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.WEIGHT, [
        {
          identifier: NOTIFICATION_ACTIONS.OPEN_WEIGHT_LOG,
          buttonTitle: '⚖️ Registrar Peso',
          options: { opensAppToForeground: true },
        },
        {
          identifier: NOTIFICATION_ACTIONS.REMIND_WEIGHT_TOMORROW,
          buttonTitle: '🗓️ Mañana',
          options: { opensAppToForeground: false },
        },
      ]),

      // Categoría: RACHA SOS
      Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.STREAK, [
        {
          identifier: NOTIFICATION_ACTIONS.RESCUE_STREAK,
          buttonTitle: '⚡ Salvar Racha',
          options: { opensAppToForeground: true },
        },
        {
          identifier: NOTIFICATION_ACTIONS.REST_SHIELD,
          buttonTitle: '🛡️ Usar Escudo',
          options: { opensAppToForeground: false },
        },
      ]),

      // Categoría: COACH
      Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.COACH, [
        {
          identifier: NOTIFICATION_ACTIONS.VIEW_FEEDBACK,
          buttonTitle: '💬 Ver Feedback',
          options: { opensAppToForeground: true },
        },
        {
          identifier: NOTIFICATION_ACTIONS.ACK_FEEDBACK,
          buttonTitle: '👍 Enterado',
          options: { opensAppToForeground: false },
        },
      ]),
    ]);

    // 3. Verificación de Permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    _notificationsInitialized = true;
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Error inicializando sistema de notificaciones:', error);
    return false;
  }
};

/**
 * Procesa las pulsaciones de los botones interactivos de las notificaciones.
 * Soporta ejecución en segundo plano y navegación imperativa.
 */
export const handleNotificationActionResponse = async (
  response: Notifications.NotificationResponse
) => {
  try {
    const actionId = response.actionIdentifier;
    const data = response.notification.request.content.data || {};

    console.log('🔔 Manejando acción de notificación:', actionId, data);

    // ==================== ACCIONES DE AGUA ====================
    if (
      actionId === NOTIFICATION_ACTIONS.ADD_WATER_250 ||
      actionId === NOTIFICATION_ACTIONS.ADD_WATER_500
    ) {
      const amountToAdd = actionId === NOTIFICATION_ACTIONS.ADD_WATER_500 ? 500 : 250;

      // 1. Guardar localmente en AsyncStorage
      const newTotal = await offlineStorage.addLocalWater(amountToAdd);

      // 2. Encolar en la cola de sincronización con el backend
      await offlineStorage.addToQueue('LOG_WATER', {
        amount_ml: amountToAdd,
        loggedAt: new Date().toISOString(),
      });

      // 3. Obtener meta del usuario para calcular porcentaje (2200 ml por defecto)
      const goalMl = await offlineStorage.getDailyWaterGoal();
      const pct = Math.min(100, Math.round((newTotal / goalMl) * 100));

      // 4. Feedback inmediato "Zero-Click": Confirmación en notificación de reemplazo
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💧 ¡+${amountToAdd} ml Registrados!`,
          body: `Total hoy: ${newTotal} / ${goalMl} ml (${pct}%). ¡Gran hidratación!`,
          sound: 'moonfit_water',
          data: { category: 'agua_confirm' },
        },
        trigger: { channelId: NOTIFICATION_CHANNELS.WATER },
      });
      return;
    }

    if (actionId === NOTIFICATION_ACTIONS.SNOOZE_WATER_1H) {
      // Reprogramar en 60 minutos
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Recordatorio de Agua (Pospuesto)',
          body: 'Pasó 1 hora. Tómate un vaso de agua fresca para mantener tu energía.',
          categoryIdentifier: NOTIFICATION_CATEGORIES.WATER,
          sound: 'moonfit_water',
          data: { category: 'agua' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3600,
          channelId: NOTIFICATION_CHANNELS.WATER,
        },
      });
      return;
    }

    // ==================== ACCIONES DE ENTRENAMIENTO ====================
    if (actionId === NOTIFICATION_ACTIONS.START_WORKOUT) {
      // Cargar rutina del día y navegar directo a WorkoutPlayer
      const cachedRoutines = await offlineStorage.getCachedRoutines();
      const routines = cachedRoutines.length > 0 ? cachedRoutines : DEFAULT_OFFLINE_ROUTINES;
      const todayDay = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
      // Ajustar índice (Lunes=1 -> index 0, Domingo=0 -> index 6)
      const routineIndex = todayDay === 0 ? 6 : todayDay - 1;
      const selectedRoutine = routines[routineIndex] || routines[0];

      navigate('WorkoutPlayer', { routine: selectedRoutine });
      return;
    }

    if (
      actionId === NOTIFICATION_ACTIONS.EXPRESS_WORKOUT ||
      actionId === NOTIFICATION_ACTIONS.RESCUE_STREAK
    ) {
      // Lanzar rutina express de 7 minutos
      navigate('WorkoutPlayer', { routine: EXPRESS_ROUTINE });
      return;
    }

    if (actionId === NOTIFICATION_ACTIONS.SNOOZE_WORKOUT_30M) {
      // Posponer entrenamiento 30 minutos
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ ¡Momento de tu Rutina! (Pospuesto)',
          body: 'Pasaron 30 minutos. Tu cuerpo está listo para activarse. ¡A darle!',
          categoryIdentifier: NOTIFICATION_CATEGORIES.WORKOUT,
          sound: 'moonfit_workout',
          data: { category: 'entrenar' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1800,
          channelId: NOTIFICATION_CHANNELS.WORKOUT,
        },
      });
      return;
    }

    if (
      actionId === NOTIFICATION_ACTIONS.REST_DAY ||
      actionId === NOTIFICATION_ACTIONS.REST_SHIELD
    ) {
      // Micro-confirmación de descanso consciente
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💤 Día de Descanso Registrado',
          body: 'El descanso inteligente es clave para la hipertrofia y recuperación. ¡Mañana con todo!',
          sound: 'moonfit_bell',
          data: { category: 'entrenar_confirm' },
        },
        trigger: { channelId: NOTIFICATION_CHANNELS.WORKOUT },
      });
      return;
    }

    // ==================== ACCIONES DE PESAJE ====================
    if (actionId === NOTIFICATION_ACTIONS.OPEN_WEIGHT_LOG) {
      navigate('Main', {
        screen: 'Progress',
        params: { openWeightModal: true },
      });
      return;
    }

    if (actionId === NOTIFICATION_ACTIONS.REMIND_WEIGHT_TOMORROW) {
      // Recordar en 24 horas
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚖️ Recordatorio de Pesaje Semanal',
          body: 'Ayer pospusiste el pesaje. Pésate hoy en ayunas para actualizar tu gráfica.',
          categoryIdentifier: NOTIFICATION_CATEGORIES.WEIGHT,
          sound: 'moonfit_bell',
          data: { category: 'pesarse' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 86400,
          channelId: NOTIFICATION_CHANNELS.WEIGHT,
        },
      });
      return;
    }

    // ==================== ACCIONES DEL COACH ====================
    if (actionId === NOTIFICATION_ACTIONS.VIEW_FEEDBACK) {
      navigate('Main', { screen: 'Profile' });
      return;
    }

    if (actionId === NOTIFICATION_ACTIONS.ACK_FEEDBACK) {
      // Confirmación
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👍 Confirmado',
          body: 'Mensaje marcado como leído. ¡Sigue aplicando las correcciones de tu coach!',
          data: { category: 'coach_confirm' },
        },
        trigger: { channelId: NOTIFICATION_CHANNELS.COACH },
      });
      return;
    }

    // ==================== TOQUE GENERAL EN EL BANNER (Sin pulsar botón específico) ====================
    if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      if (data.category === 'entrenar') {
        const cachedRoutines = await offlineStorage.getCachedRoutines();
        const routines = cachedRoutines.length > 0 ? cachedRoutines : DEFAULT_OFFLINE_ROUTINES;
        const todayDay = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
        const routineIndex = todayDay === 0 ? 6 : todayDay - 1;
        const selectedRoutine = routines[routineIndex] || routines[0];
        navigate('WorkoutPlayer', { routine: selectedRoutine });
      } else if (data.category === 'pesarse') {
        navigate('Main', { screen: 'Progress', params: { openWeightModal: true } });
      } else if (data.category === 'agua') {
        navigate('Main', { screen: 'Nutrition' });
      } else {
        navigate('Main', { screen: 'Dashboard' });
      }
    }
  } catch (error) {
    console.warn('Error procesando respuesta de notificación:', error);
  }
};

/**
 * Cancela notificaciones previas de una categoría específica para evitar acumulación duplicada.
 */
export const cancelNotificationByCategory = async (category: string) => {
  try {
    // 1. Cancelar por identifier determinístico (rápido y fiable, elimina el PendingIntent exacto)
    const identifierMap: Record<string, string> = {
      entrenar: NOTIFICATION_IDENTIFIERS.REMINDER_ENTRENAR,
      agua: NOTIFICATION_IDENTIFIERS.REMINDER_AGUA,
      pesarse: NOTIFICATION_IDENTIFIERS.REMINDER_PESARSE,
    };
    const fixedId = identifierMap[category];
    if (fixedId) {
      await Notifications.cancelScheduledNotificationAsync(fixedId).catch(() => {});
    }

    // 2. Sweep: limpiar cualquier notificación huérfana con data.category coincidente
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
 * Auto-calibración de zona horaria y horario de verano (DST):
 * Comprueba con el scheduler nativo si el trigger nativo (DailyTrigger / Calendar de Android)
 * sufre de un desfase de 1 hora respecto al reloj local del dispositivo (habitual en ciertas versiones
 * de Android con tzdata desactualizada o desfase GMT/DST).
 * Si detecta un desfase (ej: el usuario pide 08:00 pero el nativo calcularía 09:00),
 * compensa la hora nativa enviada al trigger para que el recordatorio suene EXACTAMENTE a la hora local deseada.
 */
export const getAdjustedHourForTrigger = async (targetHour: number, targetMinute: number): Promise<number> => {
  try {
    const testTrigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: targetHour,
      minute: targetMinute,
    };
    const nextTriggerMs = await Notifications.getNextTriggerDateAsync(testTrigger);
    if (!nextTriggerMs) return targetHour;

    const calculatedDate = new Date(nextTriggerMs);
    const calculatedHour = calculatedDate.getHours();

    let diff = calculatedHour - targetHour;
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;

    if (diff !== 0) {
      const adjustedHour = (targetHour - diff + 24) % 24;
      console.log(
        `[Notifications] ⏰ Desfase horario detectado en scheduler nativo (${diff > 0 ? '+' : ''}${diff}h). ` +
        `Ajustando hora enviada de ${targetHour}:00 a ${adjustedHour}:00 para garantizar que el recordatorio suene a las ${targetHour}:00 local.`
      );
      return adjustedHour;
    }
  } catch (err) {
    console.warn('[Notifications] No se pudo comprobar desfase con getNextTriggerDateAsync:', err);
  }
  return targetHour;
};

/**
 * Programa un recordatorio recurrente inteligente con mensajes contextuales,
 * canales diferenciados, prevención de desfase de hora y botones de acción en 1 toque.
 */
export const scheduleLocalReminder = async (
  type: string,
  timeStr: string,
  options?: {
    weekday?: number; // 1=Domingo, 2=Lunes, ..., 7=Sábado
    frequency?: string;
    routineName?: string;
  }
): Promise<boolean> => {
  try {
    const hasPermission = await initNotifications();
    if (!hasPermission) return false;

    // Cancelar alertas anteriores de este mismo tipo para evitar duplicidad
    await cancelNotificationByCategory(type);

    const [hours, minutes] = timeStr.split(':').map(Number);
    const validHours = isNaN(hours) ? 8 : Math.max(0, Math.min(23, hours));
    const validMinutes = isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));

    // Auto-calibrar hora para neutralizar cualquier desfase de 1 hora de Android/tzdata/DST
    const triggerHour = await getAdjustedHourForTrigger(validHours, validMinutes);

    // Obtener estilo de motivación configurado en perfil
    const style = await smartNotificationEngine.getMotivationStyle();

    // ==================== RECORDATORIO DE ENTRENAMIENTO ====================
    if (type === 'entrenar') {
      const workouts = await offlineStorage.getCachedWorkouts();
      // Estimar racha
      const streakDays = Math.min(30, workouts.length > 0 ? Math.max(1, workouts.length % 7) : 0);
      const smartContent = smartNotificationEngine.getSmartWorkoutMessage(
        options?.routineName,
        streakDays,
        style
      );

      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerHour,
        minute: validMinutes,
        channelId: NOTIFICATION_CHANNELS.WORKOUT,
      };

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDENTIFIERS.REMINDER_ENTRENAR,
        content: {
          title: smartContent.title,
          body: smartContent.body,
          sound: 'moonfit_workout',
          categoryIdentifier: NOTIFICATION_CATEGORIES.WORKOUT,
          data: { category: type },
        },
        trigger,
      });

      const nextTriggerMs = await Notifications.getNextTriggerDateAsync(trigger);
      if (nextTriggerMs) {
        console.log(`[Notifications] ✅ Recordatorio 'entrenar' listo para: ${new Date(nextTriggerMs).toLocaleString()}`);
      }
      return true;
    }

    // ==================== RECORDATORIO DE AGUA ====================
    if (type === 'agua') {
      const todayWater = await offlineStorage.getCachedWater();
      const goalMl = await offlineStorage.getDailyWaterGoal();
      const smartContent = smartNotificationEngine.getSmartWaterMessage(
        todayWater.total_ml || 0,
        goalMl,
        style
      );

      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerHour,
        minute: validMinutes,
        channelId: NOTIFICATION_CHANNELS.WATER,
      };

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDENTIFIERS.REMINDER_AGUA,
        content: {
          title: smartContent.title,
          body: smartContent.body,
          sound: 'moonfit_water',
          categoryIdentifier: NOTIFICATION_CATEGORIES.WATER,
          data: { category: type },
        },
        trigger,
      });

      const nextTriggerMs = await Notifications.getNextTriggerDateAsync(trigger);
      if (nextTriggerMs) {
        console.log(`[Notifications] ✅ Recordatorio 'agua' listo para: ${new Date(nextTriggerMs).toLocaleString()}`);
      }
      return true;
    }

    // ==================== RECORDATORIO DE PESAJE SEMANAL ====================
    if (type === 'pesarse') {
      const targetWeekday = options?.weekday || 1; // Default Domingo (1)
      const weights = await offlineStorage.getCachedWeightLogs();
      const currentWeight = weights.length > 0 ? weights[0].weight_kg : undefined;
      const goal = await offlineStorage.getCachedGoal();
      const targetWeight = goal?.target_weight_kg || undefined;

      const smartContent = smartNotificationEngine.getSmartWeightMessage(
        targetWeight,
        currentWeight,
        style
      );

      const trigger: Notifications.WeeklyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: targetWeekday,
        hour: triggerHour,
        minute: validMinutes,
        channelId: NOTIFICATION_CHANNELS.WEIGHT,
      };

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDENTIFIERS.REMINDER_PESARSE,
        content: {
          title: smartContent.title,
          body: smartContent.body,
          sound: 'moonfit_bell',
          categoryIdentifier: NOTIFICATION_CATEGORIES.WEIGHT,
          data: { category: type },
        },
        trigger,
      });

      const nextTriggerMs = await Notifications.getNextTriggerDateAsync(trigger);
      if (nextTriggerMs) {
        console.log(`[Notifications] ✅ Recordatorio 'pesarse' listo para: ${new Date(nextTriggerMs).toLocaleString()}`);
      }
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error programando recordatorio local:', error);
    return false;
  }
};

/**
 * Dispara una notificación de prueba instantánea (en 2 segundos) para que el usuario
 * pueda experimentar los botones interactivos, el sonido y el comportamiento en su dispositivo.
 */
export const triggerTestInteractiveNotification = async (
  type: 'agua' | 'entrenar' | 'pesarse' | 'racha'
): Promise<boolean> => {
  try {
    const hasPermission = await initNotifications();
    if (!hasPermission) return false;

    const style = await smartNotificationEngine.getMotivationStyle();

    if (type === 'agua') {
      const goalMl = await offlineStorage.getDailyWaterGoal();
      const content = smartNotificationEngine.getSmartWaterMessage(1250, goalMl, style);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: `${content.body} (Toca un botón abajo para registrar sin abrir la app)`,
          categoryIdentifier: NOTIFICATION_CATEGORIES.WATER,
          sound: 'moonfit_water',
          data: { category: 'agua', isTest: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          channelId: NOTIFICATION_CHANNELS.WATER,
        },
      });
    } else if (type === 'entrenar') {
      const content = smartNotificationEngine.getSmartWorkoutMessage(
        'Piernas & Glúteos (Fuerza)',
        5,
        style
      );
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: `${content.body} (Toca "Iniciar Rutina" para entrar al reproductor)`,
          categoryIdentifier: NOTIFICATION_CATEGORIES.WORKOUT,
          sound: 'moonfit_workout',
          data: { category: 'entrenar', isTest: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          channelId: NOTIFICATION_CHANNELS.WORKOUT,
        },
      });
    } else if (type === 'pesarse') {
      const content = smartNotificationEngine.getSmartWeightMessage(68.0, 71.5, style);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: `${content.body} (Toca "Registrar Peso" para abrir el modal directo)`,
          categoryIdentifier: NOTIFICATION_CATEGORIES.WEIGHT,
          sound: 'moonfit_bell',
          data: { category: 'pesarse', isTest: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          channelId: NOTIFICATION_CHANNELS.WEIGHT,
        },
      });
    } else if (type === 'racha') {
      const content = smartNotificationEngine.getStreakAlertMessage(7, style);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: `${content.body} (Toca "Salvar Racha" para activar rutina de 7 min)`,
          categoryIdentifier: NOTIFICATION_CATEGORIES.STREAK,
          sound: 'moonfit_workout',
          data: { category: 'racha', isTest: true },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          channelId: NOTIFICATION_CHANNELS.STREAK,
        },
      });
    }

    return true;
  } catch (e) {
    console.warn('Error disparando notificación de prueba:', e);
    return false;
  }
};

/**
 * Helper de diagnóstico: Lista todas las notificaciones actualmente programadas.
 * Útil para verificar que no hay duplicados ni huérfanas.
 */
export const debugScheduledNotifications = async () => {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[Notifications] 📋 ${all.length} notificación(es) programada(s):`);
    all.forEach((n, i) => {
      const cat = n.content.data?.category || 'N/A';
      const title = n.content.title || 'Sin título';
      console.log(`  ${i + 1}. ID: ${n.identifier} | Cat: ${cat} | Title: ${title}`);
    });
    return all;
  } catch (e) {
    console.warn('[Notifications] Error en debug:', e);
    return [];
  }
};
