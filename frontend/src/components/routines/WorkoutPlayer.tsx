import React, { useState, useEffect } from 'react';
import { Routine } from '../../types';
import { workoutsApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { ExerciseDemo } from './ExerciseDemo';
import { getExerciseMetadata } from '../../utils/exerciseMetadata';
import {
  Play,
  Pause,
  CheckCircle2,
  FastForward,
  Timer,
  Award,
  Lightbulb,
  Flame,
  Clock,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

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
  const { showToast, celebrate, playTone } = useNotification();
  const exercises = routine.exercises || [];

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Exercise Countdown Timer (for timed/isometric exercises)
  const [exerciseSecondsLeft, setExerciseSecondsLeft] = useState<number>(0);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState<boolean>(false);

  // UI helpers
  const [showTips, setShowTips] = useState<boolean>(false);
  const [workoutStartTime] = useState<number>(Date.now());
  const [totalWorkoutDurationSec, setTotalWorkoutDurationSec] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const currentExercise = exercises[currentExerciseIndex];
  const nextExercise = exercises[currentExerciseIndex + 1];
  const currentMeta = currentExercise ? getExerciseMetadata(currentExercise.exercise_name) : null;

  // Initialize exercise timer when switching exercise or set
  useEffect(() => {
    if (currentExercise && currentMeta?.isTimed && !isResting) {
      const initialSeconds = currentExercise.reps || currentMeta.defaultDuration || 45;
      setExerciseSecondsLeft(initialSeconds);
      setIsExerciseTimerRunning(true);
    } else {
      setIsExerciseTimerRunning(false);
    }
  }, [currentExerciseIndex, currentSet, isResting]);

  // Active Exercise Countdown Timer
  useEffect(() => {
    let timer: any;
    if (isExerciseTimerRunning && !isPaused && !isResting && exerciseSecondsLeft > 0) {
      timer = setInterval(() => {
        setExerciseSecondsLeft((prev) => {
          if (prev <= 1) {
            playTone('success');
            handleCompleteSet();
            return 0;
          }
          if (prev <= 4) {
            playTone('beep');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExerciseTimerRunning, isPaused, isResting, exerciseSecondsLeft]);

  // Rest Countdown Timer
  useEffect(() => {
    let timer: any;
    if (isResting && !isPaused && restSecondsLeft > 0) {
      timer = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            playTone('beep');
            setIsResting(false);
            return 0;
          }
          if (prev === 4) {
            playTone('beep');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, isPaused, restSecondsLeft, playTone]);

  const handleCompleteSet = () => {
    playTone('beep');
    if (currentSet < currentExercise.sets) {
      setCurrentSet((prev) => prev + 1);
      setRestSecondsLeft(currentExercise.rest_seconds || 45);
      setIsResting(true);
    } else {
      if (currentExerciseIndex + 1 < exercises.length) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
        setRestSecondsLeft(currentExercise.rest_seconds || 45);
        setIsResting(true);
      } else {
        finishWorkout();
      }
    }
  };

  const finishWorkout = async () => {
    const elapsedSec = Math.max(60, Math.round((Date.now() - workoutStartTime) / 1000));
    setTotalWorkoutDurationSec(elapsedSec);
    setIsCompleted(true);
    playTone('success');
    celebrate();

    try {
      await workoutsApi.log({
        routine_id: routine.id,
        status: 'COMPLETADA',
        duration_seconds: elapsedSec,
        exercises_completed: exercises.length,
        total_exercises: exercises.length,
      });
      showToast('¡Entrenamiento Guardado!', 'Se ha registrado como completado en tu historial.', 'success');
    } catch (err: any) {
      showToast('Error al registrar entrenamiento', err.message, 'error');
    }
  };

  const handleCancelWorkout = async () => {
    const elapsedSec = Math.round((Date.now() - workoutStartTime) / 1000);
    // If user spent more than 15s or finished at least part of an exercise, record as canceled
    if (elapsedSec > 15 || currentExerciseIndex > 0 || currentSet > 1) {
      const confirmCancel = window.confirm(
        '¿Deseas registrar esta sesión como cancelada en tu historial o salir sin registrar?'
      );
      if (confirmCancel) {
        try {
          await workoutsApi.log({
            routine_id: routine.id,
            status: 'CANCELADA',
            duration_seconds: elapsedSec,
            exercises_completed: currentExerciseIndex,
            total_exercises: exercises.length,
          });
          showToast('Sesión registrada', 'Se ha guardado como cancelada en tu historial.', 'info');
        } catch (e: any) {
          console.error(e);
        }
      }
    }
    onCancel();
  };

  // Estimated calories burned
  const durationMinutes = Math.round(totalWorkoutDurationSec / 60) || 20;
  const estimatedCalories = Math.round(
    routine.type === 'HIIT' || routine.type === 'cardio'
      ? durationMinutes * 8.5
      : durationMinutes * 6.8
  );

  const handleShareAchievement = () => {
    const shareText = `🔥 ¡Acabo de completar mi rutina "${routine.name}" en MoonFit! 🍑💪 ${durationMinutes} min de entrenamiento en casa superados.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast('¡Copiado al Portapapeles!', 'Pega tu logro en WhatsApp o Instagram Stories.', 'success');
    } else {
      showToast('Logro', shareText, 'info');
    }
    setShowShareModal(true);
  };

  // ── COMPLETION SCREEN ──
  if (isCompleted) {
    return (
      <div
        className="glass-panel flex-center animate-fade-in"
        style={{
          padding: '40px 24px',
          flexDirection: 'column',
          textAlign: 'center',
          gap: '20px',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px var(--color-accent-glow)',
          }}
        >
          <Award size={52} color="#fff" />
        </div>

        <div>
          <span className="badge badge-success" style={{ marginBottom: '8px' }}>
            ¡MISIÓN CUMPLIDA!
          </span>
          <h2 style={{ fontSize: '2.4rem', color: '#fff', margin: 0 }}>
            ¡RUTINA COMPLETADA!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
            Has finalizado todos los ejercicios de <strong>{routine.name}</strong>.
          </p>
        </div>

        {/* Metrics Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            width: '100%',
          }}
        >
          <div className="glass-card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <Clock size={20} color="var(--color-primary)" style={{ margin: '0 auto 4px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TIEMPO</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              {durationMinutes} min
            </div>
          </div>

          <div className="glass-card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <Flame size={20} color="#ef4444" style={{ margin: '0 auto 4px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>QUEMA APROX</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              ~{estimatedCalories} kcal
            </div>
          </div>

          <div className="glass-card" style={{ padding: '12px 8px', textAlign: 'center' }}>
            <Sparkles size={20} color="var(--color-accent)" style={{ margin: '0 auto 4px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EJERCICIOS</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              {exercises.length} / {exercises.length}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          <button
            onClick={handleShareAchievement}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            <Share2 size={18} /> Compartir Logro
          </button>
          <button
            onClick={onFinish}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <CheckCircle2 size={18} /> Volver al Inicio
          </button>
        </div>

        {/* Share Modal Dialog */}
        {showShareModal && (
          <div
            className="glass-card animate-fade-in"
            style={{
              padding: '20px',
              border: '2px solid var(--color-primary)',
              background: 'rgba(15, 23, 42, 0.95)',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              ✨ Tarjeta de Celebración MoonFit
            </span>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '8px 0' }}>
              ¡Texto copiado! Pégalo en tu estado de WhatsApp o historia de Instagram para inspirar a otros.
            </p>
            <button
              onClick={() => setShowShareModal(false)}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '8px' }}
            >
              Listo
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!currentExercise) {
    return <div>No hay ejercicios en esta rutina.</div>;
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Sesión Activa • {routine.type}
          </span>
          <h3 style={{ fontSize: '1.6rem', color: '#fff', margin: 0 }}>
            {routine.name}
          </h3>
        </div>
        <button onClick={handleCancelWorkout} className="btn btn-ghost btn-sm">
          Cancelar
        </button>
      </div>

      {/* Progress indicators */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>Ejercicio {currentExerciseIndex + 1} de {exercises.length}</span>
          <span>Serie {currentSet} de {currentExercise.sets}</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentExerciseIndex + currentSet / currentExercise.sets) / exercises.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--color-primary), #fb923c)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Main Exercise Card or Rest Mode */}
      {isResting ? (
        /* REST MODE */
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '32px 20px',
            textAlign: 'center',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '2px solid var(--color-accent)',
            marginBottom: '24px',
          }}
        >
          <Timer size={32} color="var(--color-accent)" className="animate-pulse" style={{ marginBottom: '8px' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
            Tiempo de Descanso
          </span>
          <div
            className="font-heading"
            style={{
              fontSize: '4.5rem',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
              margin: '12px 0',
            }}
          >
            {restSecondsLeft} <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>seg</span>
          </div>

          {/* Next exercise preview during rest */}
          {nextExercise && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                margin: '16px auto',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                maxWidth: '380px',
              }}
            >
              <ExerciseDemo exerciseName={nextExercise.exercise_name} size="md" />
              <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Siguiente:
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                  {nextExercise.exercise_name}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {nextExercise.sets} series × {nextExercise.reps} {getExerciseMetadata(nextExercise.exercise_name).unit}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn btn-secondary btn-sm"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? 'Reanudar' : 'Pausar'}
            </button>
            <button
              onClick={() => setRestSecondsLeft((p) => p + 15)}
              className="btn btn-secondary btn-sm"
            >
              +15s
            </button>
            <button
              onClick={() => setIsResting(false)}
              className="btn btn-accent btn-sm"
            >
              <FastForward size={16} /> Saltar Descanso
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE EXERCISE MODE */
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '24px 20px',
            textAlign: 'center',
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Exercise animation demo */}
          <ExerciseDemo exerciseName={currentExercise.exercise_name} size="lg" />

          {/* Exercise Name & Target Muscle Chips */}
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: 0 }}>
              {currentExercise.exercise_name}
            </h2>
            {currentMeta && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
                {currentMeta.targetMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      color: '#fb923c',
                      background: 'rgba(249, 115, 22, 0.15)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                    }}
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Set / Reps Info or Countdown Timer */}
          {currentMeta?.isTimed ? (
            /* ISOMETRIC / TIMED EXERCISE COUNTDOWN */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                <div className="glass-panel" style={{ padding: '8px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SERIE</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {currentSet} / {currentExercise.sets}
                  </div>
                </div>

                {/* Big Timer Clock */}
                <div
                  className="glass-panel"
                  style={{
                    padding: '8px 24px',
                    textAlign: 'center',
                    border: '2px solid var(--color-primary)',
                    background: 'rgba(249, 115, 22, 0.15)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    TIEMPO RESTANTE
                  </span>
                  <div
                    className="font-heading"
                    style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}
                  >
                    {exerciseSecondsLeft} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>seg</span>
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="btn btn-secondary btn-sm"
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                  {isPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={() => setExerciseSecondsLeft((s) => s + 10)}
                  className="btn btn-secondary btn-sm"
                >
                  +10s
                </button>
                <button
                  onClick={handleCompleteSet}
                  className="btn btn-primary btn-sm"
                >
                  <CheckCircle2 size={16} /> Listo
                </button>
              </div>
            </div>
          ) : (
            /* REPS BASED EXERCISE */
            <>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '10px 20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SERIE</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {currentSet} / {currentExercise.sets}
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '10px 20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REPETICIONES</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                    {currentExercise.reps}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCompleteSet}
                className="btn btn-primary"
                style={{ width: '100%', maxWidth: '320px', padding: '16px' }}
              >
                <CheckCircle2 size={22} /> COMPLETAR SERIE
              </button>
            </>
          )}

          {/* Collapsible Technique & Tips Section */}
          {currentMeta && (
            <div style={{ width: '100%', maxWidth: '420px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="btn btn-ghost btn-sm"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                <Lightbulb size={16} color="var(--color-primary)" />
                <span>{showTips ? 'Ocultar Técnica y Postura' : 'Ver Técnica y Tips de Postura'}</span>
                {showTips ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showTips && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid var(--border-subtle)',
                    marginTop: '8px',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tips de Ejecución en Casa:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {currentMeta.postureTips.map((tip, tIdx) => (
                      <li key={tIdx} style={{ marginBottom: '4px' }}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Next Exercise Preview (when not resting) */}
      {!isResting && nextExercise && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Siguiente ejercicio:
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
              {nextExercise.exercise_name} ({nextExercise.sets} series x {nextExercise.reps} {getExerciseMetadata(nextExercise.exercise_name).unit})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
