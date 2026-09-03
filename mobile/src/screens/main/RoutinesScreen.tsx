import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/common/Header';
import { ExerciseDemo } from '../../components/routines/ExerciseDemo';
import { RoutineDetailModal } from '../../components/routines/RoutineDetailModal';
import { offlineStorage } from '../../utils/offlineStorage';
import { routinesApi, workoutsApi } from '../../api/services';
import { Routine, WorkoutLog } from '../../types';
import { theme } from '../../theme';
import {
  Play,
  Clock,
  Dumbbell,
  CheckCircle2,
  XCircle,
  Plus,
  Flame,
} from 'lucide-react-native';

const CATEGORIES = ['Todas', 'Fuerza', 'Cardio', 'HIIT', 'Core', 'Glúteos'];

export const RoutinesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const loadLocalCache = async () => {
    try {
      const [cachedRoutines, cachedWorkouts] = await Promise.all([
        offlineStorage.getCachedRoutines(),
        offlineStorage.getCachedWorkouts(),
      ]);
      if (cachedRoutines && cachedRoutines.length > 0) setRoutines(cachedRoutines);
      if (cachedWorkouts && cachedWorkouts.length > 0) setWorkoutHistory(cachedWorkouts);
    } catch (e) {
      console.warn('Error reading routines cache:', e);
    }
  };

  const loadData = async () => {
    try {
      const [rRes, wRes] = await Promise.all([
        routinesApi.getRoutines().catch(() => ({ data: null })),
        workoutsApi.getHistory().catch(() => ({ data: null })),
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
    } catch (e) {
      console.log('Offline mode in RoutinesScreen: using cached routines');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLocalCache().then(() => {
      loadData();
    });
  }, []);

  const safeRoutines = Array.isArray(routines) ? routines : [];
  const filteredRoutines = safeRoutines.filter((r) => {
    if (!r) return false;
    if (selectedCategory === 'Todas') return true;
    const typeMatch = r.type ? r.type.toLowerCase().includes(selectedCategory.toLowerCase()) : false;
    const nameMatch = r.name ? r.name.toLowerCase().includes(selectedCategory.toLowerCase()) : false;
    return typeMatch || nameMatch;
  });

  return (
    <View style={styles.container}>
      <Header title="Rutinas de Ejercicio" subtitle="35 ejercicios en casa sin equipamiento" showSyncBadge={true} />

      {/* Category Pills Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterPill, selectedCategory === cat && styles.filterPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterPillText, selectedCategory === cat && styles.filterPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.colors.primary} />}
      >
        {/* Routines Grid */}
        <Text style={styles.sectionHeader}>Catálogo de Entrenamientos ({filteredRoutines.length})</Text>

        {filteredRoutines.map((routine) => {
          const firstExName = routine.exercises?.[0]?.exercise_name || 'Sentadillas';
          const exCount = routine.exercises?.length || 5;
          const estMin = Math.max(15, exCount * 6);

          return (
            <View key={routine.id} style={styles.routineCard}>
              <ExerciseDemo exerciseName={firstExName} size="md" />

              <View style={styles.cardInfo}>
                <View style={styles.cardBadgeRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{routine.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.durationBadge}>⏱️ ~{estMin} min</Text>
                </View>

                <Text style={styles.routineName}>{routine.name}</Text>
                <Text style={styles.exercisesCount}>
                  💪 {exCount} ejercicios estructurados
                </Text>

                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => setSelectedRoutine(routine)}
                >
                  <Play size={16} color="#fff" fill="#fff" />
                  <Text style={styles.startBtnText}>Ver Ejercicios e Iniciar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Workout History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.historyTitle}>Historial ({workoutHistory.length})</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('WorkoutHistory')}
              style={styles.viewAllHistoryBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.viewAllHistoryBtnText}>Ver Completo →</Text>
            </TouchableOpacity>
          </View>

          {workoutHistory.length === 0 ? (
            <View style={styles.emptyHistoryBox}>
              <Text style={styles.emptyHistoryText}>No has realizado entrenamientos todavía.</Text>
            </View>
          ) : (
            workoutHistory.map((item) => {
              const isCompleted = item.status !== 'CANCELADA';
              const durationMin = item.duration_seconds ? Math.max(1, Math.round(item.duration_seconds / 60)) : null;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.historyCard,
                    !isCompleted && styles.historyCardCanceled,
                  ]}
                >
                  <View style={styles.historyCardLeft}>
                    <View
                      style={[
                        styles.historyIconBox,
                        isCompleted ? styles.iconCompleted : styles.iconCanceled,
                      ]}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} color={theme.colors.success} />
                      ) : (
                        <XCircle size={20} color={theme.colors.warning} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.historyRoutineName}>{item.routine?.name || 'Rutina'}</Text>
                        <View style={[styles.statusBadge, isCompleted ? styles.statusBadgeCompleted : styles.statusBadgeCanceled]}>
                          <Text style={[styles.statusBadgeText, isCompleted ? { color: '#34d399' } : { color: '#fbbf24' }]}>
                            {isCompleted ? 'COMPLETADA' : 'CANCELADA'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.historyDate}>
                        📅 {new Date(item.completed_at).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })} • {new Date(item.completed_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {durationMin ? ` • ⏱️ ${durationMin} min` : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
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
  filterContainer: {
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: theme.colors.primary,
  },
  filterPillText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  routineCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 16,
  },
  cardInfo: {
    padding: 16,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  typeBadgeText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  durationBadge: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  routineName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  exercisesCount: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 14,
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  historySection: {
    marginTop: 20,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  viewAllHistoryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  viewAllHistoryBtnText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyHistoryBox: {
    padding: 24,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  emptyHistoryText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 10,
  },
  historyCardCanceled: {
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIconBox: {
    padding: 8,
    borderRadius: 50,
  },
  iconCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  iconCanceled: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  historyRoutineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusBadgeCanceled: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginTop: 4,
  },
});
