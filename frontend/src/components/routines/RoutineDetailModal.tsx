import React from 'react';
import { Routine } from '../../types';
import { Modal } from '../common/Modal';
import { ExerciseDemo } from './ExerciseDemo';
import { getExerciseMetadata } from '../../utils/exerciseMetadata';
import {
  Play,
  Clock,
  Flame,
  Home,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

interface RoutineDetailModalProps {
  routine: Routine | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: (routine: Routine) => void;
}

export const RoutineDetailModal: React.FC<RoutineDetailModalProps> = ({
  routine,
  isOpen,
  onClose,
  onStart,
}) => {
  if (!routine) return null;

  const exercises = routine.exercises || [];

  // Approximate metrics
  const totalSets = exercises.reduce((acc, curr) => acc + (curr.sets || 3), 0);
  const estimatedMinutes = Math.max(15, Math.round(totalSets * 1.6));
  const estimatedCalories = Math.round(
    routine.type === 'HIIT' || routine.type === 'cardio'
      ? estimatedMinutes * 8.5
      : estimatedMinutes * 6.8
  );

  // Extract unique equipment needed
  const equipmentList = Array.from(
    new Set(
      exercises.map((ex) => getExerciseMetadata(ex.exercise_name).equipment)
    )
  ).slice(0, 3);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={routine.name}
      maxWidth="720px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Banner with Key Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
          }}
        >
          <div
            className="glass-card flex-center"
            style={{
              padding: '12px',
              flexDirection: 'column',
              textAlign: 'center',
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.25)',
            }}
          >
            <Clock size={20} color="var(--color-primary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>DURACIÓN</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              ~{estimatedMinutes} min
            </span>
          </div>

          <div
            className="glass-card flex-center"
            style={{
              padding: '12px',
              flexDirection: 'column',
              textAlign: 'center',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <Flame size={20} color="#ef4444" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>CALORÍAS</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              ~{estimatedCalories} kcal
            </span>
          </div>

          <div
            className="glass-card flex-center"
            style={{
              padding: '12px',
              flexDirection: 'column',
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Dumbbell size={20} color="var(--color-accent)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>EJERCICIOS</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              {exercises.length} bloques
            </span>
          </div>
        </div>

        {/* Equipment needed */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <Home size={18} color="var(--color-primary)" />
          <span>
            <strong style={{ color: '#fff' }}>Elementos necesarios en casa:</strong>{' '}
            {equipmentList.join(' • ') || 'Solo tu propio peso corporal y esterilla'}
          </span>
        </div>

        {/* Exercises Breakdown List */}
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              fontWeight: 700,
              display: 'block',
              marginBottom: '10px',
            }}
          >
            Estructura de la Sesión ({exercises.length} Ejercicios):
          </span>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '6px',
            }}
          >
            {exercises.map((ex, idx) => {
              const meta = getExerciseMetadata(ex.exercise_name);
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ width: '64px', height: '64px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                    <ExerciseDemo exerciseName={ex.exercise_name} size="sm" />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          background: 'rgba(249, 115, 22, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <h5
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          color: '#fff',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ex.exercise_name}
                      </h5>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fb923c', fontWeight: 700 }}>
                        {ex.sets} series × {ex.reps} {meta.unit}
                      </span>
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>• Descanso {ex.rest_seconds || 45}s</span>
                    </div>

                    {/* Muscle tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {meta.targetMuscles.slice(0, 2).map((m, mIdx) => (
                        <span
                          key={mIdx}
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStart(routine);
            }}
            className="btn btn-primary"
            style={{ flex: 2, padding: '14px 20px', fontSize: '1rem' }}
          >
            <Play size={18} fill="#fff" /> Iniciar Sesión Guiada
          </button>
        </div>
      </div>
    </Modal>
  );
};
