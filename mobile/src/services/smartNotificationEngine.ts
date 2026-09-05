import AsyncStorage from '@react-native-async-storage/async-storage';

export type MotivationStyle = 'disciplina' | 'empatico' | 'salud';

const STORAGE_KEYS = {
  MOTIVATION_STYLE: '@moonfit_motivation_style',
  QUIET_HOURS_ENABLED: '@moonfit_quiet_hours_enabled',
  QUIET_HOURS_START: '@moonfit_quiet_hours_start',
  QUIET_HOURS_END: '@moonfit_quiet_hours_end',
};

export interface NotificationContent {
  title: string;
  body: string;
}

export const smartNotificationEngine = {
  // ==================== PREFERENCIAS DEL USUARIO ====================
  async getMotivationStyle(): Promise<MotivationStyle> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MOTIVATION_STYLE);
      if (stored === 'empatico' || stored === 'salud' || stored === 'disciplina') {
        return stored;
      }
    } catch (e) {
      console.warn('Error reading motivation style:', e);
    }
    return 'disciplina'; // Default con energía
  },

  async setMotivationStyle(style: MotivationStyle): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MOTIVATION_STYLE, style);
    } catch (e) {
      console.warn('Error saving motivation style:', e);
    }
  },

  async getQuietHours(): Promise<{ enabled: boolean; start: string; end: string }> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.QUIET_HOURS_ENABLED);
      const start = await AsyncStorage.getItem(STORAGE_KEYS.QUIET_HOURS_START);
      const end = await AsyncStorage.getItem(STORAGE_KEYS.QUIET_HOURS_END);
      return {
        enabled: enabled !== 'false', // Activado por defecto
        start: start || '22:30',
        end: end || '07:00',
      };
    } catch (e) {
      return { enabled: true, start: '22:30', end: '07:00' };
    }
  },

  async setQuietHours(enabled: boolean, start: string, end: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.QUIET_HOURS_ENABLED, String(enabled));
      await AsyncStorage.setItem(STORAGE_KEYS.QUIET_HOURS_START, start);
      await AsyncStorage.setItem(STORAGE_KEYS.QUIET_HOURS_END, end);
    } catch (e) {
      console.warn('Error saving quiet hours:', e);
    }
  },

  /**
   * Determina si la hora actual está dentro del rango de Horas de Silencio
   */
  async isInQuietHours(): Promise<boolean> {
    try {
      const config = await this.getQuietHours();
      if (!config.enabled) return false;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startH, startM] = config.start.split(':').map(Number);
      const [endH, endM] = config.end.split(':').map(Number);
      const startMinutes = (startH || 22) * 60 + (startM || 30);
      const endMinutes = (endH || 7) * 60 + (endM || 0);

      if (startMinutes > endMinutes) {
        // Pasa la medianoche (ej: 22:30 a 07:00)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
    } catch (e) {
      return false;
    }
  },

  // ==================== MENSAJES INTELIGENTES DE HIDRATACIÓN ====================
  getSmartWaterMessage(
    consumedMl: number = 0,
    goalMl: number = 2200,
    style: MotivationStyle = 'disciplina'
  ): NotificationContent {
    const validGoal = goalMl > 0 ? goalMl : 2200;
    const remainingMl = Math.max(0, validGoal - consumedMl);
    const percentage = Math.min(100, Math.round((consumedMl / validGoal) * 100));
    const hour = new Date().getHours();

    // 1. Meta ya cumplida
    if (percentage >= 100) {
      return {
        title: `🎯 ¡Meta de Agua Cumplida! (${consumedMl} / ${validGoal} ml)`,
        body: `¡Increíble! Alcanzaste el 100% de tu hidratación diaria (${validGoal} ml). Tu cuerpo y metabolismo están funcionando al máximo.`,
      };
    }

    // 2. Aún no ha bebido agua hoy (consumedMl === 0)
    if (consumedMl === 0) {
      if (style === 'disciplina') {
        if (hour >= 13) {
          return {
            title: '⚡ ¡Alerta! Cero Agua Registrada',
            body: `Son más de las 13:00 y no has tomado agua de tu meta de ${validGoal} ml. Tu cuerpo rinde la mitad deshidratado. ¡Tómate un vaso ahora!`,
          };
        }
        return {
          title: '💧 ¡Momento de Hidratarte!',
          body: `Tu meta diaria es de ${validGoal} ml. Bebe tu primer vaso para activar tu energía y metabolismo. Toca abajo para registrar +250ml.`,
        };
      }

      if (style === 'salud') {
        return {
          title: '🧬 Reactiva tu Metabolismo con Agua',
          body: `Meta de hoy: ${validGoal} ml. El agua activa la función celular, la digestión y el gasto calórico. Toca abajo para sumar tus primeros +250ml.`,
        };
      }

      // Empático
      return {
        title: '🌱 Hora de Cuidarte con Agua Fresca',
        body: `Inicia tu hidratación del día. Tienes una meta de ${validGoal} ml para sentirte con vitalidad. ¡Toca abajo para tus primeros +250ml!`,
      };
    }

    // 3. Ha bebido algo de agua pero aún no llega a la meta
    if (style === 'disciplina') {
      if (percentage < 50) {
        return {
          title: `💧 Hidratación: ${consumedMl} / ${validGoal} ml (${percentage}%)`,
          body: `Llevas ${consumedMl} ml de tus ${validGoal} ml. Faltan ${remainingMl} ml para tu objetivo. Toca un botón abajo para registrar +250ml o +500ml.`,
        };
      }
      return {
        title: `🔥 Recta Final: ${consumedMl} / ${validGoal} ml (${percentage}%)`,
        body: `Faltan solo ${remainingMl} ml para cerrar el día con disciplina perfecta (${validGoal} ml). ¡A por ello!`,
      };
    }

    if (style === 'salud') {
      return {
        title: `🧬 Optimización Celular (${consumedMl} / ${validGoal} ml)`,
        body: `Estás al ${percentage}% de tu hidratación óptima (${validGoal} ml). Mantén lubricadas tus articulaciones y acelera tu recuperación muscular.`,
      };
    }

    // Estilo Empático / Positivo
    return {
      title: `✨ ¡Gran avance! ${consumedMl} / ${validGoal} ml (${percentage}%)`,
      body: `Ya registraste ${consumedMl} ml. Solo te faltan ${remainingMl} ml para llegar a tus ${validGoal} ml diarios. ¡Tú puedes!`,
    };
  },

  // ==================== MENSAJES INTELIGENTES DE RUTINA ====================
  getSmartWorkoutMessage(
    routineName?: string,
    streakDays: number = 0,
    style: MotivationStyle = 'disciplina'
  ): NotificationContent {
    const defaultRoutine = routineName || 'tu sesión del día';

    if (style === 'disciplina') {
      if (streakDays >= 3) {
        return {
          title: `🔥 ¡Racha de ${streakDays} Días Invicto!`,
          body: `Hoy toca: ${defaultRoutine}. La pereza es opcional, tu progreso no. ¡A darle con todo!`,
        };
      }
      return {
        title: '⚡ ¡Momento de Entrenar Sin Excusas!',
        body: `Hoy el plan manda: ${defaultRoutine}. 25 minutos de enfoque total. Toca abajo para comenzar.`,
      };
    }

    if (style === 'salud') {
      return {
        title: '🧬 Cuidado Muscular & Longevidad',
        body: `Hoy toca: ${defaultRoutine}. 20 minutos de ejercicio elevan tu sensibilidad a la insulina y oxigenan tu cerebro.`,
      };
    }

    // Estilo Empático
    if (streakDays > 0) {
      return {
        title: `✨ ¡Día ${streakDays + 1} de tu Transformación!`,
        body: `Listo para disfrutar: ${defaultRoutine}. Escucha a tu cuerpo y celebra cada repetición.`,
      };
    }
    return {
      title: '🌟 ¡Momento Especial para Ti!',
      body: `Dedícate un ratito hoy con: ${defaultRoutine}. Un paso a la vez hacia tu meta.`,
    };
  },

  // ==================== MENSAJES DE PESAJE SEMANAL ====================
  getSmartWeightMessage(
    targetWeight?: number,
    currentWeight?: number,
    style: MotivationStyle = 'disciplina'
  ): NotificationContent {
    let contextNote = '';
    if (targetWeight && currentWeight) {
      const diff = Math.abs(currentWeight - targetWeight).toFixed(1);
      contextNote = ` Meta: ${targetWeight} kg (a ${diff} kg).`;
    }

    if (style === 'salud') {
      return {
        title: '⚖️ Registro Semanal de Evolución',
        body: `Pésate en ayunas y sin ropa para un dato científicamente comparable.${contextNote} ¡Registra hoy!`,
      };
    }

    return {
      title: '⚖️ Día de Báscula y Progreso',
      body: `Hoy toca medir el resultado de tu disciplina esta semana.${contextNote} Toca abajo para registrar en 5 segundos.`,
    };
  },

  // ==================== ALERTA DE RACHA EN PELIGRO (SOS) ====================
  getStreakAlertMessage(streakDays: number, style: MotivationStyle = 'disciplina'): NotificationContent {
    if (style === 'disciplina') {
      return {
        title: `🚨 ¡ALERTA: Tu Racha de ${streakDays} Días Peligra!`,
        body: `Faltan pocas horas para medianoche y no has registrado entreno. Haz 10 minutos express y mantén el invicto.`,
      };
    }
    return {
      title: `⚡ ¡No pierdas tus ${streakDays} días de constancia!`,
      body: `Una rutina corta o un paseo rápido bastan para proteger tu racha. ¡Hazlo por ti!`,
    };
  },

  // ==================== RECUPERACIÓN POST-ENTRENO ====================
  getPostWorkoutMessage(): NotificationContent {
    return {
      title: '🥤 Ventana Anabólica & Rehidratación',
      body: '¡Gran sesión completada! Toma 500ml de agua y tus proteínas para nutrir los músculos que acabas de trabajar.',
    };
  },
};
