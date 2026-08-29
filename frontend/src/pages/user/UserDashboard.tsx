import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  routinesApi,
  progressApi,
  nutritionApi,
  goalsApi,
  workoutsApi,
} from '../../api/services';
import {
  Routine,
  WeeklyWeightLog,
  WaterSummary,
  Goal,
  WorkoutLog,
} from '../../types';
import { WeightChart } from '../../components/progress/WeightChart';
import { WaterTracker } from '../../components/nutrition/WaterTracker';
import { WorkoutPlayer } from '../../components/routines/WorkoutPlayer';
import { RoutineDetailModal } from '../../components/routines/RoutineDetailModal';
import { Modal } from '../../components/common/Modal';
import {
  Dumbbell,
  Target,
  TrendingDown,
  Droplet,
  Award,
  Play,
  Flame,
  Calendar,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

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

export const UserDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [assignedRoutines, setAssignedRoutines] = useState<Routine[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeeklyWeightLog[]>([]);
  const [waterSummary, setWaterSummary] = useState<WaterSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState<Routine | null>(null);
  const [selectedDetailRoutine, setSelectedDetailRoutine] = useState<Routine | null>(null);
  const [isChangeRoutineModalOpen, setIsChangeRoutineModalOpen] = useState<boolean>(false);
  const [customSelectedRoutineId, setCustomSelectedRoutineId] = useState<number | null>(null);

  const todayIndex = new Date().getDay();
  const todayConfig = WEEK_DAYS.find((d) => d.index === todayIndex) || WEEK_DAYS[0];

  // Calculate Consecutive Days Workout Streak
  const calculateStreak = (logs: WorkoutLog[]): number => {
    if (!logs || logs.length === 0) return 0;
    const uniqueDates = Array.from(
      new Set(logs.map((l) => new Date(l.completed_at).toISOString().split('T')[0]))
    ).sort().reverse();

    if (uniqueDates.length === 0) return 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevExpected = new Date(currentDate);
      prevExpected.setDate(prevExpected.getDate() - 1);
      const prevExpectedStr = prevExpected.toISOString().split('T')[0];

      if (uniqueDates[i] === prevExpectedStr) {
        streak++;
        currentDate = new Date(uniqueDates[i]);
      } else {
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak(workoutLogs);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [routinesRes, weightRes, waterRes, goalsRes, workoutsRes] =
        await Promise.all([
          routinesApi.list(),
          progressApi.getWeightHistory(),
          nutritionApi.getWaterSummary(),
          goalsApi.list(),
          workoutsApi.getHistory(5),
        ]);

      setAssignedRoutines(routinesRes.data.assigned);
      const allRoutines = [
        ...routinesRes.data.assigned,
        ...routinesRes.data.predefined,
        ...routinesRes.data.userCreated,
      ];
      setRoutines(allRoutines);
      setWeightLogs(weightRes.data);
      setWaterSummary(waterRes.data);
      setGoals(goalsRes.data);
      setWorkoutLogs(workoutsRes.data);
    } catch (err: any) {
      showToast('Error cargando datos', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Determine Today's Recommended Routine
  const getTodayRoutine = (): Routine | undefined => {
    if (customSelectedRoutineId) {
      const custom = routines.find((r) => r.id === customSelectedRoutineId);
      if (custom) return custom;
    }

    // Priority 1: Coach assigned routine
    if (assignedRoutines.length > 0) {
      return assignedRoutines[0];
    }

    // Priority 2: Routine matching today's name (e.g. "Lunes", "Martes", "Miércoles", "Sábado", etc.)
    const dayMatched = routines.find((r) =>
      normalizeStr(r.name).startsWith(normalizeStr(todayConfig.full))
    );
    if (dayMatched) return dayMatched;

    // Priority 3: Routine matching today's target type
    const typeMatched = routines.find(
      (r) => normalizeStr(r.type) === normalizeStr(todayConfig.type)
    );
    if (typeMatched) return typeMatched;

    // Fallback: First available routine
    return routines[0];
  };

  const todayRoutine = getTodayRoutine();
  const activeGoal = goals.find((g) => g.status === 'ACTIVA') || goals[0];
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : user?.initial_weight_kg;

  if (activeWorkoutRoutine) {
    return (
      <div className="container" style={{ padding: '24px 20px' }}>
        <WorkoutPlayer
          routine={activeWorkoutRoutine}
          onFinish={() => {
            setActiveWorkoutRoutine(null);
            loadDashboardData();
          }}
          onCancel={() => setActiveWorkoutRoutine(null)}
        />
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Plan de Recomposición & Hábitos Saludables
            </span>
            <Flame size={16} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '2.4rem', color: '#fff', margin: 0 }}>
            HOLA, {user?.name.toUpperCase()}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
            {activeGoal
              ? `Meta activa: alcanzar ${activeGoal.target_weight_kg} kg • Avance actual: ${activeGoal.progress_percentage || 0}%`
              : 'Bienvenido a tu plan semanal optimizado de salud y hábitos sostenibles.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Streak Flame Badge */}
          <div
            className="glass-panel flex-center"
            style={{
              padding: '10px 16px',
              gap: '8px',
              border: streakDays > 0 ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              background: streakDays > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <Flame size={22} color={streakDays > 0 ? '#f97316' : 'var(--text-dim)'} className={streakDays > 0 ? 'animate-pulse' : ''} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Racha Activa
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: streakDays > 0 ? '#fff' : 'var(--text-muted)' }}>
                {streakDays > 0 ? `${streakDays} ${streakDays === 1 ? 'día seguido' : 'días seguidos'} 🔥` : 'Comienza hoy'}
              </div>
            </div>
          </div>

          {todayRoutine && (
            <button
              onClick={() => setSelectedDetailRoutine(todayRoutine)}
              className="btn btn-primary"
              style={{ padding: '14px 24px', boxShadow: '0 0 25px var(--color-primary-glow)' }}
            >
              <Play size={20} fill="#fff" /> Entrenar Hoy
            </button>
          )}
        </div>
      </div>

      {/* SMART WEEKLY ROUTINE SCHEDULE RIBBON */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
              Plan Semanal de Entrenamiento
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Hoy es <strong>{todayConfig.full}</strong> ({todayConfig.label})
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {WEEK_DAYS.map((day) => {
            const isToday = day.index === todayIndex;
            return (
              <div
                key={day.index}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isToday
                    ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(249, 115, 22, 0.08))'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isToday
                    ? '2px solid var(--color-primary)'
                    : '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  boxShadow: isToday ? '0 0 15px var(--color-primary-glow)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{day.icon}</div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isToday ? 'var(--color-primary)' : 'var(--text-dim)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {day.short} {isToday && '• HOY'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                  {day.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TODAY'S FOCUS WORKOUT CARD WITH SWITCHER */}
      {todayRoutine && (
        <div
          className="glass-card"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(16, 185, 129, 0.05))',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--color-primary-glow)',
                color: '#fff',
              }}
            >
              <Dumbbell size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-primary">
                  {assignedRoutines.some((r) => r.id === todayRoutine.id)
                    ? '⭐ Asignada por tu Coach'
                    : `📅 Sesión de Hoy • ${todayConfig.full}`}
                </span>
                <span className="badge badge-muted">{todayRoutine.type}</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>
                {todayRoutine.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {todayRoutine.exercises?.length || 0} ejercicios estructurados para maximizar tu energía y tonificar.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedDetailRoutine(todayRoutine)}
              className="btn btn-secondary"
            >
              Ver Ejercicios ({todayRoutine.exercises?.length || 0})
            </button>
            <button
              onClick={() => setIsChangeRoutineModalOpen(true)}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} /> Cambiar
            </button>
            <button
              onClick={() => setActiveWorkoutRoutine(todayRoutine)}
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              <Play size={18} fill="#fff" /> Iniciar Sesión Guiada
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Weight KPI */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Peso Actual</span>
            <TrendingDown size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '8px 0 4px 0' }}>
            {latestWeight || '--'} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Inicial: {user?.initial_weight_kg || '--'} kg
          </span>
        </div>

        {/* Goal KPI */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Meta Objetivo</span>
            <Target size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '8px 0 4px 0' }}>
            {activeGoal?.target_weight_kg || '--'} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>kg</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>
            {activeGoal?.progress_percentage || 0}% completado
          </span>
        </div>

        {/* Water KPI */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Agua Hoy</span>
            <Droplet size={20} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', margin: '8px 0 4px 0' }}>
            {waterSummary?.total_ml || 0} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>ml</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Meta diaria: ~2200 ml
          </span>
        </div>

        {/* Workouts KPI */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Entrenamientos</span>
            <Award size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc', margin: '8px 0 4px 0' }}>
            {workoutLogs.length} <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>sesiones</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Total completados
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Left Column: Weight Evolution Chart */}
        <div>
          <WeightChart
            logs={weightLogs}
            initialWeight={user?.initial_weight_kg}
            targetWeight={activeGoal?.target_weight_kg}
          />
        </div>

        {/* Right Column: Interactive Water Tracker */}
        <div>
          <WaterTracker
            currentMl={waterSummary?.total_ml || 0}
            targetMl={2200}
            onWaterUpdated={loadDashboardData}
          />
        </div>
      </div>

      {/* MODAL: CHANGE TODAY'S ROUTINE SELECTOR */}
      <Modal
        isOpen={isChangeRoutineModalOpen}
        onClose={() => setIsChangeRoutineModalOpen(false)}
        title="Seleccionar Rutina para Hoy"
        maxWidth="600px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, marginBottom: '6px' }}>
            Elige cualquier rutina de tu catálogo para realizarla en tu sesión de hoy:
          </p>

          {routines.map((r) => {
            const isSelected = (todayRoutine?.id === r.id);
            const isAssigned = assignedRoutines.some((ar) => ar.id === r.id);

            return (
              <div
                key={r.id}
                onClick={() => {
                  setCustomSelectedRoutineId(r.id);
                  showToast('Rutina Seleccionada', `Has seleccionado "${r.name}" para hoy.`, 'success');
                  setIsChangeRoutineModalOpen(false);
                }}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
                className="table-row-hover"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{r.name}</span>
                    {isAssigned && <span className="badge badge-success">Coach</span>}
                    <span className="badge badge-primary">{r.type}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {r.exercises?.length || 0} ejercicios • {r.exercises?.map((e) => e.exercise_name).join(', ')}
                  </span>
                </div>

                {isSelected ? (
                  <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Seleccionada
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Elegir
                  </button>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setIsChangeRoutineModalOpen(false)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* Routine Detail Modal */}
      <RoutineDetailModal
        routine={selectedDetailRoutine}
        isOpen={Boolean(selectedDetailRoutine)}
        onClose={() => setSelectedDetailRoutine(null)}
        onStart={(r) => {
          setSelectedDetailRoutine(null);
          setActiveWorkoutRoutine(r);
        }}
      />
    </div>
  );
};
