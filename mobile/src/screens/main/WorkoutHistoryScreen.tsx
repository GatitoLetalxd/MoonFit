import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { useNotification } from '../../context/NotificationContext';
import { offlineStorage } from '../../utils/offlineStorage';
import { workoutsApi } from '../../api/services';
import { WorkoutLog, Routine } from '../../types';
import { theme } from '../../theme';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Flame,
  Dumbbell,
  Award,
  Filter,
  Calendar,
} from 'lucide-react-native';

const TYPE_FILTERS = [
  { id: 'all', label: 'Todos los tipos' },
  { id: 'fuerza', label: 'Fuerza' },
  { id: 'HIIT', label: 'HIIT' },
  { id: 'core', label: 'Core / Abs' },
  { id: 'cardio', label: 'Cardio' },
];

export const WorkoutHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast, triggerHaptic } = useNotification();

  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETADA' | 'CANCELADA'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadLocalCache = async () => {
    try {
      const cached = await offlineStorage.getCachedWorkouts();
      if (cached && cached.length > 0) {
        setWorkouts(cached);
      }
    } catch (e) {
      console.warn('Error reading cached workouts:', e);
    }
  };

  const loadData = async () => {
    try {
      const res = await workoutsApi.getHistory(100);
      if (res.data && Array.isArray(res.data)) {
        setWorkouts(res.data);
        await offlineStorage.saveCachedWorkouts(res.data);
      }
    } catch (e) {
      console.log('Modo offline en historial: usando entrenamientos locales');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLocalCache().then(() => {
      loadData();
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRepeatRoutine = (routine?: Routine) => {
    if (!routine) {
      showToast('Rutina no disponible', 'No se pudieron recuperar los ejercicios de esta rutina.', 'warning');
      return;
    }
    triggerHaptic('medium');
    navigation.navigate('WorkoutPlayer', { routine });
  };

  // Filtrado reactivo
  const filteredWorkouts = workouts.filter((w) => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'all' && w.routine?.type?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Métricas acumuladas
  const completedCount = workouts.filter((w) => w.status !== 'CANCELADA').length;
  const totalMinutes = Math.round(
    workouts.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) / 60
  );

  return (
    <View style={styles.container}>
      <Header
        title="Historial de Entrenamientos"
        subtitle="Registro completo de tus sesiones y esfuerzo"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSyncBadge={true}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.colors.primary} />}
      >
        {/* KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Award size={20} color={theme.colors.success} />
            </View>
            <Text style={styles.kpiValue}>{completedCount}</Text>
            <Text style={styles.kpiLabel}>Completadas</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <Clock size={20} color={theme.colors.accent} />
            </View>
            <Text style={styles.kpiValue}>{totalMinutes}</Text>
            <Text style={styles.kpiLabel}>Minutos Totales</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Flame size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.kpiValue}>{workouts.length}</Text>
            <Text style={styles.kpiLabel}>Total Sesiones</Text>
          </View>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.statusFilterRow}>
          {(['ALL', 'COMPLETADA', 'CANCELADA'] as const).map((st) => {
            const isSelected = statusFilter === st;
            const label = st === 'ALL' ? 'Todos' : st === 'COMPLETADA' ? 'Completadas' : 'Canceladas';
            return (
              <TouchableOpacity
                key={st}
                style={[styles.statusTab, isSelected && styles.statusTabActive]}
                onPress={() => {
                  triggerHaptic('light');
                  setStatusFilter(st);
                }}
              >
                <Text style={[styles.statusTabText, isSelected && styles.statusTabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Type Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeFilterContainer}
        >
          {TYPE_FILTERS.map((tf) => {
            const isSelected = typeFilter === tf.id;
            return (
              <TouchableOpacity
                key={tf.id}
                style={[styles.typeChip, isSelected && styles.typeChipActive]}
                onPress={() => {
                  triggerHaptic('light');
                  setTypeFilter(tf.id);
                }}
              >
                <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                  {tf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List Section */}
        <View style={styles.listSection}>
          <Text style={styles.sectionHeading}>
            SESIONES REGISTRADAS ({filteredWorkouts.length})
          </Text>

          {loading && workouts.length === 0 ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : filteredWorkouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Dumbbell size={36} color={theme.colors.textDim} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>Sin entrenamientos en esta categoría</Text>
              <Text style={styles.emptySubtitle}>
                {statusFilter === 'ALL'
                  ? 'Aún no tienes registros de ejercicios finalizados.'
                  : 'Prueba cambiando los filtros arriba para ver más sesiones.'}
              </Text>
            </View>
          ) : (
            filteredWorkouts.map((item) => {
              const isCompleted = item.status !== 'CANCELADA';
              const durationMin = item.duration_seconds
                ? Math.max(1, Math.round(item.duration_seconds / 60))
                : null;

              return (
                <View
                  key={item.id}
                  style={[styles.workoutCard, !isCompleted && styles.workoutCardCanceled]}
                >
                  <View style={styles.workoutCardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.iconCircle,
                          isCompleted ? styles.iconCircleSuccess : styles.iconCircleWarning,
                        ]}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} color={theme.colors.success} />
                        ) : (
                          <XCircle size={18} color={theme.colors.warning} />
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.routineTitle} numberOfLines={1}>
                          {item.routine?.name || 'Rutina Personalizada'}
                        </Text>
                        <View style={styles.tagsRow}>
                          <View
                            style={[
                              styles.statusPill,
                              isCompleted ? styles.statusPillSuccess : styles.statusPillWarning,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                isCompleted ? { color: '#34d399' } : { color: '#fbbf24' },
                              ]}
                            >
                              {isCompleted ? 'COMPLETADA' : 'CANCELADA'}
                            </Text>
                          </View>
                          {item.routine?.type ? (
                            <View style={styles.typePill}>
                              <Text style={styles.typePillText}>{item.routine.type.toUpperCase()}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Metadata Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={13} color={theme.colors.textMuted} />
                      <Text style={styles.metaText}>
                        {new Date(item.completed_at).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(item.completed_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    {durationMin !== null && (
                      <View style={styles.metaItem}>
                        <Clock size={13} color={theme.colors.accent} />
                        <Text style={[styles.metaText, { color: theme.colors.accent }]}>
                          {durationMin} min
                        </Text>
                      </View>
                    )}

                    {item.exercises_completed !== null &&
                      item.exercises_completed !== undefined &&
                      item.total_exercises && (
                        <View style={styles.metaItem}>
                          <Dumbbell size={13} color={theme.colors.primary} />
                          <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                            {item.exercises_completed}/{item.total_exercises} ej.
                          </Text>
                        </View>
                      )}
                  </View>

                  {/* Repeat Routine Button */}
                  {item.routine && (
                    <TouchableOpacity
                      style={styles.repeatBtn}
                      onPress={() => handleRepeatRoutine(item.routine)}
                      activeOpacity={0.8}
                    >
                      <RotateCw size={14} color={theme.colors.primary} />
                      <Text style={styles.repeatBtnText}>Repetir Entrenamiento</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
  },
  kpiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statusFilterRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  statusTabActive: {
    backgroundColor: theme.colors.primary,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  statusTabTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  typeFilterContainer: {
    gap: 8,
    paddingBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typeChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textDim,
  },
  typeChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  listSection: {
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  centerLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.lg,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
  workoutCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 12,
  },
  workoutCardCanceled: {
    opacity: 0.85,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  workoutCardHeader: {
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  iconCircleWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  routineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  typePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typePillText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    marginTop: 8,
  },
  repeatBtnText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
