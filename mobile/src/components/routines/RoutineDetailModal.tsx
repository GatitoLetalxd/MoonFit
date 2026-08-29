import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Routine } from '../../types';
import { ExerciseDemo } from './ExerciseDemo';
import { getExerciseMetadata } from '../../utils/exerciseMetadata';
import { theme } from '../../theme';
import { X, Flame, Clock, Dumbbell, Play, ShieldAlert } from 'lucide-react-native';

interface RoutineDetailModalProps {
  routine: Routine | null;
  visible: boolean;
  onClose: () => void;
  onStart: (routine: Routine) => void;
}

export const RoutineDetailModal: React.FC<RoutineDetailModalProps> = ({
  routine,
  visible,
  onClose,
  onStart,
}) => {
  if (!routine) return null;

  const exercises = routine.exercises || [];
  const estimatedMin = Math.max(15, exercises.length * 6);
  const estimatedCal = Math.round(
    routine.type.toLowerCase().includes('hiit') || routine.type.toLowerCase().includes('cardio')
      ? estimatedMin * 8.5
      : estimatedMin * 6.8
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.routineType}>{routine.type.toUpperCase()}</Text>
              <Text style={styles.title}>{routine.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Clock size={16} color={theme.colors.primary} />
              <Text style={styles.metricValue}>~{estimatedMin} min</Text>
              <Text style={styles.metricLabel}>Duración</Text>
            </View>
            <View style={styles.metricCard}>
              <Flame size={16} color={theme.colors.accent} />
              <Text style={styles.metricValue}>~{estimatedCal} kcal</Text>
              <Text style={styles.metricLabel}>Calorías</Text>
            </View>
            <View style={styles.metricCard}>
              <Dumbbell size={16} color={theme.colors.success} />
              <Text style={styles.metricValue}>{exercises.length}</Text>
              <Text style={styles.metricLabel}>Ejercicios</Text>
            </View>
          </View>

          {/* Exercise List */}
          <Text style={styles.sectionHeading}>Ejercicios de la Rutina</Text>
          <ScrollView style={styles.exerciseScroll} showsVerticalScrollIndicator={false}>
            {exercises.map((ex, index) => {
              const meta = getExerciseMetadata(ex.exercise_name);
              return (
                <View key={ex.id || index} style={styles.exerciseItem}>
                  <ExerciseDemo exerciseName={ex.exercise_name} size="sm" />
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>
                      {index + 1}. {ex.exercise_name}
                    </Text>
                    <Text style={styles.exerciseSpecs}>
                      {ex.sets} series • {ex.reps} {meta.isTimed ? 'segundos' : 'reps'} • {ex.rest_seconds}s descanso
                    </Text>
                    <Text style={styles.exerciseMuscles} numberOfLines={1}>
                      🎯 {meta.targetMuscles.join(', ')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Start Action */}
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => {
              onClose();
              onStart(routine);
            }}
          >
            <Play size={20} color="#fff" fill="#fff" />
            <Text style={styles.startBtnText}>Comenzar Rutina Ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: 24,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routineType: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  exerciseScroll: {
    maxHeight: 280,
    marginBottom: 18,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  exerciseSpecs: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  exerciseMuscles: {
    fontSize: 11,
    color: theme.colors.primary,
    marginTop: 2,
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
