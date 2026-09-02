import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Routine, RoutineExercise, WorkoutLog } from '../../types';
import { ExerciseDemo } from './ExerciseDemo';
import { getExerciseMetadata } from '../../utils/exerciseMetadata';
import { offlineStorage } from '../../utils/offlineStorage';
import { workoutsApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { useSync } from '../../context/SyncContext';
import { theme } from '../../theme';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Flame,
  Clock,
  Dumbbell,
  Lightbulb,
  Award,
} from 'lucide-react-native';

interface WorkoutPlayerProps {
  routine: Routine;
  onFinish: () => void;
  onCancel: () => void;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  routine,
  onFinish,
  onCancel,
}) => {
  const { showToast, triggerHaptic } = useNotification();
  const exercises = routine.exercises || [];

  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(45);

  // Timed exercise state
  const [timedSecondsLeft, setTimedSecondsLeft] = useState<number>(0);
  const [isTimedActive, setIsTimedActive] = useState<boolean>(false);

  // Tips accordion
  const [showTips, setShowTips] = useState<boolean>(false);

  // Completion state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  const currentEx: RoutineExercise | undefined = exercises[currentExIndex];
  const meta = currentEx ? getExerciseMetadata(currentEx.exercise_name) : null;

  // Inicializar temporizador al cambiar de ejercicio
  useEffect(() => {
    if (meta?.isTimed && currentEx) {
      setTimedSecondsLeft(currentEx.reps || meta.defaultSeconds || 30);
      setIsTimedActive(true);
    } else {
      setIsTimedActive(false);
    }
  }, [currentExIndex, currentSet]);

  // Temporizador para ejercicio isométrico / por tiempo
  useEffect(() => {
    let timer: any = null;
    if (isTimedActive && !isResting && timedSecondsLeft > 0) {
      timer = setInterval(() => {
        setTimedSecondsLeft((prev) => {
          if (prev <= 1) {
            triggerHaptic('success');
            handleCompleteSet();
            return 0;
          }
          if (prev <= 4) {
            triggerHaptic('light');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimedActive, isResting, timedSecondsLeft]);

  // Temporizador de descanso
  useEffect(() => {
    let timer: any = null;
    if (isResting && restSecondsLeft > 0) {
      timer = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            triggerHaptic('medium');
            setIsResting(false);
            return 0;
          }
          if (prev <= 4) {
            triggerHaptic('light');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, restSecondsLeft]);

  const handleCompleteSet = () => {
    if (!currentEx) return;
    triggerHaptic('success');

    if (currentSet < currentEx.sets) {
      setCurrentSet((prev) => prev + 1);
      setRestSecondsLeft(currentEx.rest_seconds || 45);
      setIsResting(true);
    } else {
      if (currentExIndex + 1 < exercises.length) {
        setCurrentExIndex((prev) => prev + 1);
        setCurrentSet(1);
        setRestSecondsLeft(currentEx.rest_seconds || 45);
        setIsResting(true);
      } else {
        finishSession();
      }
    }
  };

  const { isOnline, enqueueAction } = useSync();

  const finishSession = async () => {
    const elapsed = Math.max(60, Math.round((Date.now() - startTimeRef.current) / 1000));
    setTotalSeconds(elapsed);
    setIsCompleted(true);
    triggerHaptic('success');

    const completedAt = new Date().toISOString();
    const localLog: WorkoutLog = {
      id: Date.now(),
      user_id: '',
      routine_id: routine.id,
      routine,
      status: 'COMPLETADA',
      duration_seconds: elapsed,
      exercises_completed: exercises.length,
      total_exercises: exercises.length,
      completed_at: completedAt,
    };

    // 1. Guardar de inmediato en almacenamiento local para racha e historial offline
    await offlineStorage.appendLocalWorkout(localLog);

    const payload = {
      routine_id: routine.id,
      status: 'COMPLETADA' as const,
      duration_seconds: elapsed,
      exercises_completed: exercises.length,
      total_exercises: exercises.length,
      completed_at: completedAt,
    };

    if (isOnline) {
      try {
        await workoutsApi.log(payload);
      } catch (e: any) {
        await enqueueAction('LOG_WORKOUT', payload);
      }
    } else {
      await enqueueAction('LOG_WORKOUT', payload);
    }

    showToast('¡Entrenamiento Completado!', 'Sesión guardada en tu historial.', 'success');
  };

  const handleCancel = () => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

    if (elapsed > 15 || currentExIndex > 0 || currentSet > 1) {
      Alert.alert(
        'Cancelar Entrenamiento',
        '¿Deseas registrar este avance como sesión cancelada en tu historial?',
        [
          {
            text: 'Salir sin registrar',
            style: 'destructive',
            onPress: onCancel,
          },
          {
            text: 'Guardar y Salir',
            onPress: async () => {
              const completedAt = new Date().toISOString();
              const localLog: WorkoutLog = {
                id: Date.now(),
                user_id: '',
                routine_id: routine.id,
                routine,
                status: 'CANCELADA',
                duration_seconds: elapsed,
                exercises_completed: currentExIndex,
                total_exercises: exercises.length,
                completed_at: completedAt,
              };

              await offlineStorage.appendLocalWorkout(localLog);

              const payload = {
                routine_id: routine.id,
                status: 'CANCELADA' as const,
                duration_seconds: elapsed,
                exercises_completed: currentExIndex,
                total_exercises: exercises.length,
                completed_at: completedAt,
              };

              if (isOnline) {
                try {
                  await workoutsApi.log(payload);
                } catch (e) {
                  await enqueueAction('LOG_WORKOUT', payload);
                }
              } else {
                await enqueueAction('LOG_WORKOUT', payload);
              }

              showToast('Sesión guardada', 'Registrada como cancelada.', 'info');
              onCancel();
            },
          },
        ]
      );
    } else {
      onCancel();
    }
  };

  // Pantalla de Celebración Final
  if (isCompleted) {
    const durationMin = Math.round(totalSeconds / 60) || 15;
    const estCal = Math.round(durationMin * 7.5);

    return (
      <View style={styles.completedContainer}>
        <View style={styles.completedCard}>
          <Award size={64} color={theme.colors.primary} />
          <Text style={styles.completedTitle}>¡ENTRENAMIENTO COMPLETADO!</Text>
          <Text style={styles.completedSubtitle}>Has demostrado tu compromiso hoy con MoonFit</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.summaryValue}>{durationMin} min</Text>
              <Text style={styles.summaryLabel}>Tiempo Total</Text>
            </View>
            <View style={styles.summaryBox}>
              <Flame size={20} color={theme.colors.accent} />
              <Text style={styles.summaryValue}>~{estCal} kcal</Text>
              <Text style={styles.summaryLabel}>Quemadas</Text>
            </View>
            <View style={styles.summaryBox}>
              <CheckCircle2 size={20} color={theme.colors.success} />
              <Text style={styles.summaryValue}>{exercises.length}/{exercises.length}</Text>
              <Text style={styles.summaryLabel}>Ejercicios</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.finishBtn} onPress={onFinish}>
            <Text style={styles.finishBtnText}>Volver al Menú Principal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentEx || !meta) return null;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.routineHeaderType}>{routine.type.toUpperCase()}</Text>
          <Text style={styles.routineHeaderName}>{routine.name}</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress Line */}
      <View style={styles.progressTracker}>
        <Text style={styles.progressText}>
          Ejercicio {currentExIndex + 1} de {exercises.length}
        </Text>
        <Text style={styles.progressText}>
          Serie {currentSet} de {currentEx.sets}
        </Text>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Visual WebP Animation */}
        <ExerciseDemo exerciseName={currentEx.exercise_name} size="lg" />

        {/* Resting Mode Banner or Active Workout Mode */}
        {isResting ? (
          <View style={styles.restBanner}>
            <Text style={styles.restTitle}>DESCANSO</Text>
            <Text style={styles.restTimer}>{restSecondsLeft}s</Text>
            <View style={styles.restActions}>
              <TouchableOpacity
                style={styles.restAdjustBtn}
                onPress={() => setRestSecondsLeft((p) => Math.max(5, p - 10))}
              >
                <Text style={styles.restAdjustText}>-10s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.skipRestBtn}
                onPress={() => setIsResting(false)}
              >
                <Text style={styles.skipRestText}>Continuar Ya</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.restAdjustBtn}
                onPress={() => setRestSecondsLeft((p) => p + 30)}
              >
                <Text style={styles.restAdjustText}>+30s</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.activeInfoCard}>
            <Text style={styles.activeExName}>{currentEx.exercise_name}</Text>

            {meta.isTimed ? (
              <View style={styles.timedBlock}>
                <Text style={styles.timedCountdown}>{timedSecondsLeft}s</Text>
                <Text style={styles.timedLabel}>Mantén la postura</Text>
              </View>
            ) : (
              <View style={styles.repsBlock}>
                <Text style={styles.repsValue}>{currentEx.reps}</Text>
                <Text style={styles.repsLabel}>Repeticiones Objetivo</Text>
              </View>
            )}

            {/* Posture & Technique Accordion */}
            <TouchableOpacity
              style={styles.tipsToggle}
              onPress={() => setShowTips(!showTips)}
            >
              <Lightbulb size={16} color={theme.colors.primary} />
              <Text style={styles.tipsToggleText}>Técnica y Postura Correcta</Text>
              {showTips ? <ChevronUp size={16} color="#fff" /> : <ChevronDown size={16} color="#fff" />}
            </TouchableOpacity>

            {showTips && (
              <View style={styles.tipsBox}>
                <Text style={styles.musclesText}>
                  🎯 Músculos: {meta.targetMuscles.join(', ')}
                </Text>
                {meta.tips.map((tip, idx) => (
                  <Text key={idx} style={styles.tipItem}>
                    • {tip}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Completion Action */}
      {!isResting && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.completeSetBtn} onPress={handleCompleteSet}>
            <CheckCircle2 size={22} color="#fff" />
            <Text style={styles.completeSetText}>
              {meta.isTimed ? 'Finalizar Serie' : `Completar Serie ${currentSet}/${currentEx.sets}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  routineHeaderType: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  routineHeaderName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTracker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  scrollArea: {
    flex: 1,
    padding: 20,
  },
  restBanner: {
    marginTop: 20,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderRadius: theme.radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  restTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1.5,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginVertical: 10,
  },
  restActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  restAdjustBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  restAdjustText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  skipRestBtn: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  skipRestText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  activeInfoCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  activeExName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  timedBlock: {
    alignItems: 'center',
    marginVertical: 14,
  },
  timedCountdown: {
    fontSize: 44,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  timedLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  repsBlock: {
    alignItems: 'center',
    marginVertical: 14,
  },
  repsValue: {
    fontSize: 44,
    fontWeight: '900',
    color: theme.colors.accent,
  },
  repsLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: theme.radius.sm,
    marginTop: 8,
  },
  tipsToggleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8,
  },
  tipsBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.radius.sm,
  },
  musclesText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipItem: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  bottomBar: {
    padding: 20,
    backgroundColor: 'rgba(11, 15, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  completeSetBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  completeSetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  completedContainer: {
    flex: 1,
    backgroundColor: '#0B0F17',
    justifyContent: 'center',
    padding: 24,
  },
  completedCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.9)',
    borderRadius: theme.radius.xl,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    width: '100%',
  },
  summaryBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  finishBtn: {
    width: '100%',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
