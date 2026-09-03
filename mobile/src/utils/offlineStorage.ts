import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Routine,
  WorkoutLog,
  WeeklyWeightLog,
  Goal,
  Reminder,
  Meal,
  SyncQueueItem,
  SyncActionType,
} from '../types';

export const STORAGE_KEYS = {
  ROUTINES: '@moonfit_cached_routines',
  WORKOUTS: '@moonfit_cached_workouts',
  WATER: '@moonfit_cached_water',
  WEIGHTS: '@moonfit_cached_weights',
  GOAL: '@moonfit_cached_goal',
  REMINDERS: '@moonfit_cached_reminders',
  MEALS: '@moonfit_cached_meals',
  SYNC_QUEUE: '@moonfit_sync_queue',
};

// 7 Rutinas predeterminadas de respaldo en caso de primera instalación offline
export const DEFAULT_OFFLINE_ROUTINES: Routine[] = [
  {
    id: 1,
    name: 'Lunes: Glúteos y Piernas (Fuerza & Tonificación)',
    type: 'fuerza',
    is_predefined: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: 101, routine_id: 1, exercise_name: 'Puente de Glúteos con Pausa de 2s', sets: 4, reps: 15, rest_seconds: 45, order_index: 1 },
      { id: 102, routine_id: 1, exercise_name: 'Sentadillas Búlgaras con Apoyo Elevado', sets: 3, reps: 10, rest_seconds: 45, order_index: 2 },
      { id: 103, routine_id: 1, exercise_name: 'Sentadilla Isométrica en Pared (Wall Sit)', sets: 3, reps: 45, rest_seconds: 45, order_index: 3 },
      { id: 104, routine_id: 1, exercise_name: 'Zancadas Dinámicas Alternas', sets: 3, reps: 12, rest_seconds: 45, order_index: 4 },
      { id: 105, routine_id: 1, exercise_name: 'Elevaciones de Talones para Gemelos', sets: 3, reps: 20, rest_seconds: 30, order_index: 5 },
    ],
  },
  {
    id: 2,
    name: 'Martes: Quema Grasa y Aceleración Metabólica (HIIT)',
    type: 'HIIT',
    is_predefined: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: 201, routine_id: 2, exercise_name: 'Saltos en Tijera (Jumping Jacks)', sets: 4, reps: 45, rest_seconds: 30, order_index: 1 },
      { id: 202, routine_id: 2, exercise_name: 'Escaladores de Montaña (Mountain Climbers)', sets: 4, reps: 30, rest_seconds: 30, order_index: 2 },
      { id: 203, routine_id: 2, exercise_name: 'Sentadillas con Salto Explosivo', sets: 4, reps: 15, rest_seconds: 30, order_index: 3 },
      { id: 204, routine_id: 2, exercise_name: 'Burpees Controlados', sets: 3, reps: 10, rest_seconds: 45, order_index: 4 },
      { id: 205, routine_id: 2, exercise_name: 'Paso de Patinador Lateral (Skater Hops)', sets: 4, reps: 30, rest_seconds: 30, order_index: 5 },
    ],
  },
  {
    id: 3,
    name: 'Miércoles: Torso Firme, Brazos y Espalda',
    type: 'fuerza',
    is_predefined: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: 301, routine_id: 3, exercise_name: 'Flexiones de Pecho (Inclinadas o Rodillas)', sets: 4, reps: 10, rest_seconds: 45, order_index: 1 },
      { id: 302, routine_id: 3, exercise_name: 'Remo con Tensión en Toalla / Botellas', sets: 4, reps: 12, rest_seconds: 45, order_index: 2 },
      { id: 303, routine_id: 3, exercise_name: 'Fondos de Tríceps en Apoyo Elevado', sets: 3, reps: 12, rest_seconds: 45, order_index: 3 },
      { id: 304, routine_id: 3, exercise_name: 'Plancha con Toques de Hombro Controlados', sets: 3, reps: 16, rest_seconds: 30, order_index: 4 },
      { id: 305, routine_id: 3, exercise_name: 'Elevaciones de Brazos en Y-T-W (Espalda y Postura)', sets: 3, reps: 12, rest_seconds: 30, order_index: 5 },
    ],
  },
  {
    id: 4,
    name: 'Jueves: Cintura Esbelta y Vientre Plano (Core)',
    type: 'core',
    is_predefined: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: 401, routine_id: 4, exercise_name: 'Plancha Abdominal Frontal Isométrica', sets: 4, reps: 45, rest_seconds: 45, order_index: 1 },
      { id: 402, routine_id: 4, exercise_name: 'Bicho Muerto (Deadbug para Vientre Plano)', sets: 3, reps: 12, rest_seconds: 45, order_index: 2 },
      { id: 403, routine_id: 4, exercise_name: 'Plancha Lateral con Elevación de Cadera', sets: 3, reps: 10, rest_seconds: 45, order_index: 3 },
      { id: 404, routine_id: 4, exercise_name: 'Perro de Caza (Bird-Dog para Lumbar y Glúteo)', sets: 3, reps: 12, rest_seconds: 30, order_index: 4 },
      { id: 405, routine_id: 4, exercise_name: 'Bicicleta Abdominal con Respiración Rítmica', sets: 3, reps: 20, rest_seconds: 30, order_index: 5 },
    ],
  },
  {
    id: 5,
    name: 'Viernes: Glúteos de Acero e Isquiotibiales',
    type: 'fuerza',
    is_predefined: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: 501, routine_id: 5, exercise_name: 'Patadas de Glúteo en Cuadrupedial', sets: 4, reps: 15, rest_seconds: 30, order_index: 1 },
      { id: 502, routine_id: 5, exercise_name: 'Puente de Glúteos a Una Pierna', sets: 3, reps: 10, rest_seconds: 45, order_index: 2 },
      { id: 503, routine_id: 5, exercise_name: 'Abducciones de Cadera (Clamshells)', sets: 3, reps: 15, rest_seconds: 30, order_index: 3 },
      { id: 504, routine_id: 5, exercise_name: 'Deslizamiento de Isquiotibiales con Toalla', sets: 3, reps: 10, rest_seconds: 45, order_index: 4 },
      { id: 505, routine_id: 5, exercise_name: 'Zancadas Reversas con Elevación de Rodilla', sets: 3, reps: 12, rest_seconds: 45, order_index: 5 },
    ],
  },
  {
    id: 6,
    name: 'Sábado: Full Body Dinámico y Cardio Tono',
    type: 'cardio',
    is_predefined: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: 601, routine_id: 6, exercise_name: 'Sentadillas con Elevación de Brazos', sets: 4, reps: 15, rest_seconds: 30, order_index: 1 },
      { id: 602, routine_id: 6, exercise_name: 'Saltos de Cuerda Simulados', sets: 4, reps: 60, rest_seconds: 30, order_index: 2 },
      { id: 603, routine_id: 6, exercise_name: 'Plancha Spiderman', sets: 3, reps: 12, rest_seconds: 45, order_index: 3 },
      { id: 604, routine_id: 6, exercise_name: 'Paso del Oso Isométrico (Bear Crawl Hold)', sets: 3, reps: 30, rest_seconds: 45, order_index: 4 },
      { id: 605, routine_id: 6, exercise_name: 'Sentadilla Profunda con Pausa de 2s', sets: 3, reps: 12, rest_seconds: 45, order_index: 5 },
    ],
  },
  {
    id: 7,
    name: 'Domingo: Movilidad, Postura y Descarga Muscular',
    type: 'core',
    is_predefined: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: 701, routine_id: 7, exercise_name: 'Estiramiento Gato-Vaca para Columna', sets: 3, reps: 10, rest_seconds: 30, order_index: 1 },
      { id: 702, routine_id: 7, exercise_name: 'Postura de la Paloma para Caderas', sets: 3, reps: 45, rest_seconds: 30, order_index: 2 },
      { id: 703, routine_id: 7, exercise_name: 'Apertura de Pecho y Hombros en Pared', sets: 3, reps: 45, rest_seconds: 30, order_index: 3 },
      { id: 704, routine_id: 7, exercise_name: "Postura del Niño (Child's Pose)", sets: 3, reps: 60, rest_seconds: 30, order_index: 4 },
      { id: 705, routine_id: 7, exercise_name: 'Respiración Diafragmática & Vacío Abdominal', sets: 3, reps: 8, rest_seconds: 30, order_index: 5 },
    ],
  },
];

// Helper para fecha local en formato YYYY-MM-DD
const getTodayKey = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const offlineStorage = {
  // ==================== RUTINAS ====================
  async getCachedRoutines(): Promise<Routine[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached routines:', e);
    }
    return DEFAULT_OFFLINE_ROUTINES;
  },

  async saveCachedRoutines(routines: Routine[]): Promise<void> {
    try {
      if (Array.isArray(routines) && routines.length > 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
      }
    } catch (e) {
      console.warn('Error saving cached routines:', e);
    }
  },

  // ==================== HISTORIAL DE ENTRENAMIENTOS ====================
  async getCachedWorkouts(): Promise<WorkoutLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading cached workouts:', e);
    }
    return [];
  },

  async saveCachedWorkouts(logs: WorkoutLog[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Error saving cached workouts:', e);
    }
  },

  async appendLocalWorkout(log: WorkoutLog): Promise<WorkoutLog[]> {
    try {
      const current = await this.getCachedWorkouts();
      // Prepend nuevo log
      const updated = [log, ...current.filter((w) => w.id !== log.id)];
      await this.saveCachedWorkouts(updated);
      return updated;
    } catch (e) {
      console.warn('Error appending local workout:', e);
      return [log];
    }
  },

  // ==================== AGUA DIARIA ====================
  async getCachedWater(dateStr?: string): Promise<{ total_ml: number }> {
    try {
      const key = dateStr || getTodayKey();
      const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.WATER}_${key}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading cached water:', e);
    }
    return { total_ml: 0 };
  },

  async saveCachedWater(data: { total_ml: number }, dateStr?: string): Promise<void> {
    try {
      const key = dateStr || getTodayKey();
      await AsyncStorage.setItem(`${STORAGE_KEYS.WATER}_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Error saving cached water:', e);
    }
  },

  async addLocalWater(amount_ml: number): Promise<number> {
    try {
      const today = await this.getCachedWater();
      const newTotal = (today.total_ml || 0) + amount_ml;
      await this.saveCachedWater({ total_ml: newTotal });
      return newTotal;
    } catch (e) {
      console.warn('Error adding local water:', e);
      return amount_ml;
    }
  },

  // ==================== PESOS / PROGRESO ====================
  async getCachedWeightLogs(): Promise<WeeklyWeightLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading cached weights:', e);
    }
    return [];
  },

  async saveCachedWeightLogs(logs: WeeklyWeightLog[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Error saving cached weights:', e);
    }
  },

  async appendLocalWeight(log: WeeklyWeightLog): Promise<WeeklyWeightLog[]> {
    try {
      const current = await this.getCachedWeightLogs();
      const updated = [...current, log].sort(
        (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
      );
      await this.saveCachedWeightLogs(updated);
      return updated;
    } catch (e) {
      console.warn('Error appending local weight:', e);
      return [log];
    }
  },

  // ==================== META ACTIVA ====================
  async getCachedGoal(): Promise<Goal | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GOAL);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading cached goal:', e);
    }
    return null;
  },

  async saveCachedGoal(goal: Goal | null): Promise<void> {
    try {
      if (goal) {
        await AsyncStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.GOAL);
      }
    } catch (e) {
      console.warn('Error saving cached goal:', e);
    }
  },

  // ==================== RECORDATORIOS / ALARMAS ====================
  async getCachedReminders(): Promise<Reminder[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading cached reminders:', e);
    }
    return [];
  },

  async saveCachedReminders(reminders: Reminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Error saving cached reminders:', e);
    }
  },

  async updateLocalReminder(id: number, patch: Partial<Reminder>): Promise<Reminder[]> {
    try {
      const current = await this.getCachedReminders();
      const updated = current.map((r) => (r.id === id ? { ...r, ...patch } : r));
      await this.saveCachedReminders(updated);
      return updated;
    } catch (e) {
      console.warn('Error updating local reminder:', e);
      return [];
    }
  },

  // ==================== COLA DE SINCRONIZACIÓN (SYNC QUEUE) ====================
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading sync queue:', e);
    }
    return [];
  },

  async saveSyncQueue(queue: SyncQueueItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn('Error saving sync queue:', e);
    }
  },

  async addToQueue(
    type: SyncActionType,
    payload: any
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      created_at: new Date().toISOString(),
      retry_count: 0,
    };

    try {
      const queue = await this.getSyncQueue();
      queue.push(item);
      await this.saveSyncQueue(queue);
    } catch (e) {
      console.warn('Error adding to sync queue:', e);
    }

    return item;
  },

  async removeFromQueue(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const filtered = queue.filter((item) => item.id !== id);
      await this.saveSyncQueue(filtered);
    } catch (e) {
      console.warn('Error removing from sync queue:', e);
    }
  },

  async incrementQueueItemRetry(id: string): Promise<number> {
    try {
      const queue = await this.getSyncQueue();
      let retryCount = 1;
      const updated = queue.map((item) => {
        if (item.id === id) {
          retryCount = (item.retry_count || 0) + 1;
          return { ...item, retry_count: retryCount };
        }
        return item;
      });
      await this.saveSyncQueue(updated);
      return retryCount;
    } catch (e) {
      console.warn('Error incrementing retry count in sync queue:', e);
      return 1;
    }
  },

  async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const moonfitCacheKeys = allKeys.filter(
        (key) =>
          key.startsWith('@moonfit_cached_') ||
          key.startsWith('@moonfit_sync_') ||
          key === STORAGE_KEYS.ROUTINES ||
          key === STORAGE_KEYS.WORKOUTS ||
          key === STORAGE_KEYS.WEIGHTS ||
          key === STORAGE_KEYS.GOAL ||
          key === STORAGE_KEYS.REMINDERS ||
          key === STORAGE_KEYS.MEALS ||
          key === STORAGE_KEYS.SYNC_QUEUE
      );

      if (moonfitCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(moonfitCacheKeys);
      }
    } catch (e) {
      console.warn('Error clearing offline cache:', e);
    }
  },
};
