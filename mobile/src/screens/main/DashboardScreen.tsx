import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useNotification } from '../../context/NotificationContext';
import { offlineStorage } from '../../utils/offlineStorage';
import { Header } from '../../components/common/Header';
import { RoutineDetailModal } from '../../components/routines/RoutineDetailModal';
import { routinesApi, workoutsApi, nutritionApi, goalsApi } from '../../api/services';
import { Routine, WorkoutLog, Goal } from '../../types';
import { theme } from '../../theme';
import {
  Flame,
  Play,
  Droplets,
  Calendar,
  Clock,
  Dumbbell,
  Target,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';

const WEEK_DAYS = [
  { index: 1, short: 'LUN', full: 'Lunes', type: 'fuerza', label: 'Glúteos & Piernas', icon: '🍑' },
  { index: 2, short: 'MAR', full: 'Martes', type: 'HIIT', label: 'HIIT Quema Grasa', icon: '⚡' },
  { index: 3, short: 'MIÉ', full: 'Miércoles', type: 'fuerza', label: 'Torso & Brazos', icon: '💪' },
  { index: 4, short: 'JUE', full: 'Jueves', type: 'core', label: 'Cintura & Abdomen', icon: '🔥' },
  { index: 5, short: 'VIE', full: 'Viernes', type: 'fuerza', label: 'Glúteos & Cadena Post.', icon: '🏋️' },
  { index: 6, short: 'SÁB', full: 'Sábado', type: 'cardio', label: 'Circuito Total Body', icon: '🏃' },
  { index: 0, short: 'DOM', full: 'Domingo', type: 'core', label: 'Movilidad & Flexibilidad', icon: '🧘' },
];

const normalizeStr = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Obtenemos el índice del día local del dispositivo (0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb)
const getLocalDayIndex = (): number => {
  const d = new Date().getDay();
  return isNaN(d) ? 5 : d;
};

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { showToast, triggerHaptic } = useNotification();
  const { isOnline, enqueueAction } = useSync();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [todayWaterMl, setTodayWaterMl] = useState<number>(0);

  // Selected day for the planner (defaults to today's local day index)
  const todayDayIndex = getLocalDayIndex();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayDayIndex);

  // Selected routine for modal preview
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  // 1. Cargar caché local de forma instantánea (0ms)
  const loadLocalCache = async () => {
    try {
      const [cachedRoutines, cachedWorkouts, cachedWater, cachedGoal] = await Promise.all([
        offlineStorage.getCachedRoutines(),
        offlineStorage.getCachedWorkouts(),
        offlineStorage.getCachedWater(),
        offlineStorage.getCachedGoal(),
      ]);

      if (cachedRoutines && cachedRoutines.length > 0) setRoutines(cachedRoutines);
      if (cachedWorkouts && cachedWorkouts.length > 0) setWorkoutHistory(cachedWorkouts);
      if (cachedWater && typeof cachedWater.total_ml === 'number') setTodayWaterMl(cachedWater.total_ml);
      if (cachedGoal) setActiveGoal(cachedGoal);
    } catch (e) {
      console.warn('Error cargando caché local del dashboard:', e);
    }
  };

  // 2. Refrescar datos desde la API si hay internet y actualizar caché
  const loadData = async () => {
    try {
      const [rRes, wRes, waterRes, gRes] = await Promise.all([
        routinesApi.getRoutines().catch(() => ({ data: null })),
        workoutsApi.getHistory().catch(() => ({ data: null })),
        nutritionApi.getTodayWater().catch(() => ({ data: null })),
        goalsApi.getActiveGoal().catch(() => ({ data: null })),
      ]);

      if (rRes.data) {
        let list: Routine[] = [];
        if (Array.isArray(rRes.data)) {
          list = rRes.data;
        } else if (typeof rRes.data === 'object') {
          list = [
            ...((rRes.data as any).assigned || []),
            ...((rRes.data as any).userCreated || []),
            ...((rRes.data as any).predefined || []),
          ];
        }
        if (list.length > 0) {
          setRoutines(list);
          await offlineStorage.saveCachedRoutines(list);
        }
      }

      if (wRes.data && Array.isArray(wRes.data)) {
        setWorkoutHistory(wRes.data);
        await offlineStorage.saveCachedWorkouts(wRes.data);
      }

      if (waterRes.data && typeof waterRes.data.total_ml === 'number') {
        setTodayWaterMl(waterRes.data.total_ml);
        await offlineStorage.saveCachedWater(waterRes.data);
      }

      if (gRes.data) {
        setActiveGoal(gRes.data);
        await offlineStorage.saveCachedGoal(gRes.data);
      }
    } catch (e) {
      console.log('Modo offline activo: usando datos cacheados');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setSelectedDayIndex(getLocalDayIndex());
    loadLocalCache().then(() => {
      loadData();
    });
  }, []);

  const handleAddWater = async (ml: number) => {
    triggerHaptic('success');
    // Actualización inmediata en UI y almacenamiento local
    setTodayWaterMl((prev) => prev + ml);
    await offlineStorage.addLocalWater(ml);

    if (isOnline) {
      try {
        await nutritionApi.logWater(ml);
      } catch (e: any) {
        await enqueueAction('LOG_WATER', { amount_ml: ml, loggedAt: new Date().toISOString() });
      }
    } else {
      await enqueueAction('LOG_WATER', { amount_ml: ml, loggedAt: new Date().toISOString() });
    }

    showToast('¡Hidratación Registrada!', `+${ml} ml añadidos a tu meta de hoy.`, 'success');
  };

  // Cálculo de racha activa usando fecha local del dispositivo
  const calculateStreak = () => {
    if (!workoutHistory || workoutHistory.length === 0) return 0;
    const completed = workoutHistory.filter((w) => w.status !== 'CANCELADA');
    if (completed.length === 0) return 0;

    const toLocalYYYYMMDD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const dates = Array.from(
      new Set(completed.map((w) => toLocalYYYYMMDD(new Date(w.completed_at))))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const now = new Date();
    const todayStr = toLocalYYYYMMDD(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalYYYYMMDD(yesterday);

    if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = dates.includes(todayStr) ? new Date(now) : yesterday;

    while (true) {
      const dStr = toLocalYYYYMMDD(checkDate);
      if (dates.includes(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streakDays = calculateStreak();

  const selectedDayConfig =
    WEEK_DAYS.find((d) => d.index === selectedDayIndex) || WEEK_DAYS.find((d) => d.index === todayDayIndex) || WEEK_DAYS[4];
  const isSelectedToday = selectedDayIndex === todayDayIndex;

  // Selección inteligente de la rutina según el día
  const getRoutineForDay = (dayConfig: typeof WEEK_DAYS[0]): Routine | null => {
    if (!routines || routines.length === 0) return null;

    // Prioridad 1: Coincidencia por nombre de día (ej: "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")
    const searchName = normalizeStr(dayConfig.full);
    const dayMatched = routines.find((r) =>
      normalizeStr(r.name).includes(searchName)
    );
    if (dayMatched) return dayMatched;

    // Prioridad 2: Coincidencia por tipo de rutina (ej: "fuerza", "HIIT", "core", "cardio")
    const typeMatched = routines.find(
      (r) => r.type && normalizeStr(r.type) === normalizeStr(dayConfig.type)
    );
    if (typeMatched) return typeMatched;

    return routines[0];
  };

  const recommendedRoutine = getRoutineForDay(selectedDayConfig);

  return (
    <View style={styles.container}>
      <Header showSyncBadge={true} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.colors.primary} />}
      >
        {/* Welcome Greeting & Streaks Bar */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.greetingText}>¡HOLA, {user?.name?.toUpperCase() || 'CAMPEONA'}! 👋</Text>
            <Text style={styles.subGreeting}>Tu transformación diaria en casa</Text>
          </View>

          <View style={styles.streakBadge}>
            <Flame size={24} color={streakDays > 0 ? theme.colors.accent : theme.colors.textDim} fill={streakDays > 0 ? theme.colors.accent : 'transparent'} />
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.streakNum}>{streakDays}</Text>
              <Text style={styles.streakLabel}>DÍAS</Text>
            </View>
          </View>
        </View>

        {/* Weekly Day Selector Strip */}
        <View style={styles.weekStripContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekStripContent}>
            {WEEK_DAYS.map((day) => {
              const isToday = day.index === todayDayIndex;
              const isSelected = day.index === selectedDayIndex;
              return (
                <TouchableOpacity
                  key={day.index}
                  style={[
                    styles.dayPill,
                    isSelected && styles.dayPillSelected,
                    isToday && !isSelected && styles.dayPillToday,
                  ]}
                  onPress={() => {
                    triggerHaptic('light');
                    setSelectedDayIndex(day.index);
                  }}
                >
                  <Text style={styles.dayPillIcon}>{day.icon}</Text>
                  <Text style={[styles.dayPillText, isSelected && styles.dayPillTextSelected]}>
                    {day.short}
                  </Text>
                  {isToday && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Recommended Routine Hero */}
        {recommendedRoutine && (
          <View style={styles.heroSection}>
            <View style={styles.heroHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.sectionTitle}>
                  {isSelectedToday ? 'RUTINA DE HOY' : `RUTINA DEL ${selectedDayConfig.full.toUpperCase()}`}
                </Text>
                <Text style={styles.heroDayTag}>{selectedDayConfig.label}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Routines')}>
                <Text style={styles.viewAllText}>Ver Todas</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroCardTop}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{recommendedRoutine.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.heroCardDuration}>~30 min • {selectedDayConfig.icon}</Text>
              </View>

              <Text style={styles.heroTitle}>{recommendedRoutine.name}</Text>
              <Text style={styles.heroSubtitle}>
                {recommendedRoutine.exercises?.length || 5} ejercicios • Sin equipamiento
              </Text>

              <TouchableOpacity
                style={styles.heroStartBtn}
                onPress={() => setSelectedRoutine(recommendedRoutine)}
              >
                <Play size={18} color="#fff" fill="#fff" />
                <Text style={styles.heroStartBtnText}>Ver Ejercicios e Iniciar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Water Tracker Widget */}
        <View style={styles.waterWidget}>
          <View style={styles.waterHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Droplets size={20} color={theme.colors.primary} />
              <Text style={styles.waterTitle}>Agua de Hoy</Text>
            </View>
            <Text style={styles.waterProgressText}>{todayWaterMl} / 2200 ml</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.waterBarTrack}>
            <View
              style={[
                styles.waterBarFill,
                { width: `${Math.min(100, (todayWaterMl / 2200) * 100)}%` },
              ]}
            />
          </View>

          {/* Quick Add Buttons */}
          <View style={styles.waterButtonsRow}>
            <TouchableOpacity style={styles.waterBtn} onPress={() => handleAddWater(250)}>
              <Text style={styles.waterBtnText}>+250 ml (Vaso)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterBtn} onPress={() => handleAddWater(500)}>
              <Text style={styles.waterBtnText}>+500 ml (Botella)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access Menu Cards */}
        <Text style={styles.sectionTitle}>SEGUIMIENTO RÁPIDO</Text>
        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('Progress')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <TrendingUp size={22} color={theme.colors.success} />
            </View>
            <Text style={styles.menuCardTitle}>Peso Semanal</Text>
            <Text style={styles.menuCardDesc}>Gráfica y medidas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('Nutrition')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <Flame size={22} color={theme.colors.accent} />
            </View>
            <Text style={styles.menuCardTitle}>Nutrición</Text>
            <Text style={styles.menuCardDesc}>Registro en 3 clics</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Routine Detail Modal */}
      <RoutineDetailModal
        routine={selectedRoutine}
        visible={!!selectedRoutine}
        onClose={() => setSelectedRoutine(null)}
        onStart={(r) => {
          setSelectedRoutine(null);
          navigation.navigate('WorkoutPlayer', { routine: r });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(23, 31, 48, 0.8)',
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 20,
  },
  welcomeLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  streakNum: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.accent,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textDim,
  },
  weekStripContainer: {
    marginBottom: 20,
  },
  weekStripContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 54,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  dayPillSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayPillToday: {
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  dayPillIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
  },
  dayPillTextSelected: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  heroSection: {
    marginBottom: 22,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroDayTag: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  heroCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: theme.radius.xl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  heroBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  heroCardDuration: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  heroStartBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroStartBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  waterWidget: {
    backgroundColor: 'rgba(23, 31, 48, 0.8)',
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 22,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  waterTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  waterProgressText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  waterBarTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: 14,
  },
  waterBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  waterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  waterBtn: {
    flex: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  waterBtnText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  menuGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  menuCard: {
    flex: 1,
    backgroundColor: 'rgba(23, 31, 48, 0.8)',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  menuCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  menuCardDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
