import React, { useState, useEffect } from 'react';
import { routinesApi, workoutsApi } from '../../api/services';
import { Routine, WorkoutLog } from '../../types';
import { WorkoutPlayer } from '../../components/routines/WorkoutPlayer';
import { ExerciseDemo } from '../../components/routines/ExerciseDemo';
import { RoutineDetailModal } from '../../components/routines/RoutineDetailModal';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Dumbbell,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  UserCheck,
} from 'lucide-react';

const SUGGESTED_TEMPLATES = [
  {
    id: 'gluteos',
    title: '🍑 Glúteos & Piernas',
    type: 'fuerza',
    name: 'Glúteos & Piernas Esculpidas',
    exercises: [
      { exercise_name: 'Puente de Glúteos con Pausa de 2s', sets: 4, reps: 15, rest_seconds: 45 },
      { exercise_name: 'Sentadillas Búlgaras con Apoyo Elevado', sets: 3, reps: 10, rest_seconds: 45 },
      { exercise_name: 'Sentadilla Isométrica en Pared (Wall Sit)', sets: 3, reps: 45, rest_seconds: 45 },
      { exercise_name: 'Zancadas Dinámicas Alternas', sets: 3, reps: 12, rest_seconds: 45 },
    ],
  },
  {
    id: 'hiit',
    title: '⚡ HIIT Quema Grasa',
    type: 'HIIT',
    name: 'HIIT Aceleración Metabólica',
    exercises: [
      { exercise_name: 'Saltos en Tijera (Jumping Jacks)', sets: 4, reps: 45, rest_seconds: 30 },
      { exercise_name: 'Escaladores de Montaña (Mountain Climbers)', sets: 4, reps: 30, rest_seconds: 30 },
      { exercise_name: 'Sentadillas con Salto Explosivo', sets: 4, reps: 15, rest_seconds: 30 },
      { exercise_name: 'Burpees Controlados', sets: 3, reps: 10, rest_seconds: 45 },
    ],
  },
  {
    id: 'torso',
    title: '💪 Torso, Brazos & Espalda',
    type: 'fuerza',
    name: 'Torso Firme & Postura',
    exercises: [
      { exercise_name: 'Flexiones de Pecho (Inclinadas o Rodillas)', sets: 4, reps: 10, rest_seconds: 45 },
      { exercise_name: 'Remo con Tensión en Toalla / Botellas', sets: 4, reps: 12, rest_seconds: 45 },
      { exercise_name: 'Fondos de Tríceps en Apoyo Elevado', sets: 3, reps: 12, rest_seconds: 45 },
      { exercise_name: 'Plancha con Toques de Hombro Controlados', sets: 3, reps: 16, rest_seconds: 30 },
    ],
  },
  {
    id: 'core',
    title: '🔥 Cintura & Vientre Plano',
    type: 'core',
    name: 'Cintura Esbelta & Abdomen Plano',
    exercises: [
      { exercise_name: 'Plancha Abdominal Frontal Isométrica', sets: 4, reps: 45, rest_seconds: 45 },
      { exercise_name: 'Bicho Muerto (Deadbug para Vientre Plano)', sets: 3, reps: 12, rest_seconds: 45 },
      { exercise_name: 'Plancha Lateral con Elevación de Cadera', sets: 3, reps: 10, rest_seconds: 45 },
      { exercise_name: 'Perro de Caza (Bird-Dog para Lumbar y Glúteo)', sets: 3, reps: 12, rest_seconds: 30 },
    ],
  },
];

const SUGGESTED_EXERCISES = [
  'Puente de Glúteos con Pausa de 2s',
  'Puente de Glúteos a Una Sola Pierna',
  'Sentadillas Búlgaras con Apoyo Elevado',
  'Sentadilla Isométrica en Pared (Wall Sit)',
  'Sentadilla Profunda con Pausa de 2 Segundos Abajo',
  'Zancadas Dinámicas Alternas',
  'Zancadas Reversas con Elevación de Rodilla',
  'Elevaciones de Talones para Gemelos',
  'Deslizamiento de Isquiotibiales con Toalla',
  'Patadas de Glúteo en Cuadrupedia con Isometría',
  'Abducciones de Cadera (Clamshells) Acostada',
  'Saltos en Tijera (Jumping Jacks)',
  'Escaladores de Montaña (Mountain Climbers)',
  'Sentadillas con Salto Explosivo',
  'Burpees Controlados',
  'Paso de Patinador Lateral (Skater Hops)',
  'Flexiones de Pecho (Inclinadas o Rodillas)',
  'Remo con Tensión en Toalla / Botellas',
  'Fondos de Tríceps en Apoyo Elevado',
  'Plancha con Toques de Hombro Controlados',
  'Elevaciones de Brazos en Y-T-W (Espalda y Postura)',
  'Plancha Abdominal Frontal Isométrica',
  'Bicho Muerto (Deadbug para Vientre Plano)',
  'Plancha Lateral con Elevación de Cadera',
  'Perro de Caza (Bird-Dog para Lumbar y Glúteo)',
  'Bicicleta Abdominal con Respiración Rítmica',
  'Sentadillas con Elevación de Brazos al Techo',
  'Saltos de Cuerda Simulados en el Sitio',
  'Plancha Spiderman (Rodilla al Codo)',
  'Paso del Oso Isométrico (Bear Crawl Hold)',
  'Estiramiento Gato-Vaca para Columna',
  'Postura de la Paloma para Glúteos y Caderas',
  'Apertura de Pecho y Hombros en Pared',
  'Postura del Niño (Child’s Pose) para Relajar Espalda',
  'Respiración Diafragmática y Vacío Abdominal Suave',
];

export const RoutinesPage: React.FC = () => {
  const { showToast, celebrate } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [predefinedRoutines, setPredefinedRoutines] = useState<Routine[]>([]);
  const [assignedRoutines, setAssignedRoutines] = useState<Routine[]>([]);
  const [userRoutines, setUserRoutines] = useState<Routine[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);

  const [activeWorkout, setActiveWorkout] = useState<Routine | null>(null);
  const [selectedDetailRoutine, setSelectedDetailRoutine] = useState<Routine | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Routine Form State
  const [newRoutineName, setNewRoutineName] = useState<string>('');
  const [newRoutineType, setNewRoutineType] = useState<string>('fuerza');
  const [newExercises, setNewExercises] = useState<
    Array<{ exercise_name: string; sets: number; reps: number; rest_seconds: number }>
  >([
    { exercise_name: 'Puente de Glúteos con Pausa de 2s', sets: 4, reps: 15, rest_seconds: 45 },
    { exercise_name: 'Sentadillas Búlgaras con Apoyo Elevado', sets: 3, reps: 10, rest_seconds: 45 },
    { exercise_name: 'Plancha Abdominal Frontal Isométrica', sets: 3, reps: 45, rest_seconds: 45 },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routinesRes, historyRes] = await Promise.all([
        routinesApi.list(),
        workoutsApi.getHistory(15),
      ]);
      setPredefinedRoutines(routinesRes.data.predefined);
      setAssignedRoutines(routinesRes.data.assigned);
      setUserRoutines(routinesRes.data.userCreated);
      setWorkoutHistory(historyRes.data);
    } catch (err: any) {
      showToast('Error cargando rutinas', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyTemplate = (template: typeof SUGGESTED_TEMPLATES[0]) => {
    setNewRoutineName(template.name);
    setNewRoutineType(template.type);
    setNewExercises(template.exercises.map((e) => ({ ...e })));
    showToast('Plantilla Aplicada', `Se cargó la estructura de "${template.title}". Puedes personalizarla.`, 'info');
  };

  const handleAddExerciseRow = () => {
    setNewExercises((prev) => [
      ...prev,
      { exercise_name: '', sets: 3, reps: 12, rest_seconds: 45 },
    ]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setNewExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    setNewExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName.trim()) {
      showToast('Nombre requerido', 'Ingresa un nombre para tu rutina', 'warning');
      return;
    }

    const validExercises = newExercises.filter((e) => e.exercise_name.trim() !== '');
    if (validExercises.length === 0) {
      showToast('Ejercicios requeridos', 'Agrega al menos un ejercicio', 'warning');
      return;
    }

    try {
      await routinesApi.create({
        name: newRoutineName,
        type: newRoutineType,
        exercises: validExercises,
      });
      showToast('¡Rutina Creada!', 'Tu rutina personalizada está lista para entrenar.', 'success');
      celebrate();
      setIsCreateModalOpen(false);
      setNewRoutineName('');
      loadData();
    } catch (err: any) {
      showToast('Error al crear rutina', err.message, 'error');
    }
  };

  const handleDeleteRoutine = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta rutina personalizada?')) return;
    try {
      await routinesApi.delete(id);
      showToast('Rutina eliminada', '', 'info');
      loadData();
    } catch (err: any) {
      showToast('Error al eliminar', err.message, 'error');
    }
  };

  if (activeWorkout) {
    return (
      <div className="container" style={{ padding: '24px 20px' }}>
        <WorkoutPlayer
          routine={activeWorkout}
          onFinish={() => {
            setActiveWorkout(null);
            loadData();
          }}
          onCancel={() => setActiveWorkout(null)}
        />
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* HTML Datalist for instant exercise suggestions */}
      <datalist id="exercise-suggestions">
        {SUGGESTED_EXERCISES.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0 }}>
            CATÁLOGO DE RUTINAS
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Explora el plan semanal guiado, rutinas asignadas por tu coach o crea tus propias rutinas personalizadas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
          style={{ boxShadow: '0 0 20px var(--color-primary-glow)' }}
        >
          <Plus size={18} /> Crear Rutina Personalizada
        </button>
      </div>

      {/* 1. Assigned Routines by Coach (if any) */}
      {assignedRoutines.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <UserCheck size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
              Asignadas por tu Coach
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {assignedRoutines.map((routine) => (
              <div key={routine.id} className="glass-card" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-success">Asignada</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Por: {routine.assigned_by || 'Admin'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px' }}>{routine.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {routine.exercises?.length || 0} ejercicios • Enfoque {routine.type}
                </div>
                <button
                  onClick={() => setActiveWorkout(routine)}
                  className="btn btn-accent btn-sm"
                  style={{ width: '100%' }}
                >
                  <Play size={16} fill="#fff" /> Iniciar Sesión Guiada
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Predefined System Routines (7 Days) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Flame size={20} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
            Plan Semanal Recomendado ({predefinedRoutines.length} Rutinas)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {predefinedRoutines.map((routine) => (
            <div key={routine.id} className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
              {/* Exercise thumbnail */}
              {routine.exercises?.[0] && (
                <ExerciseDemo exerciseName={routine.exercises[0].exercise_name} size="sm" />
              )}

              <div style={{ padding: '16px 20px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-primary">{routine.type}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {routine.exercises?.length || 0} ejercicios
                  </span>
                </div>

                <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>
                  {routine.name}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                  {routine.exercises?.slice(0, 3).map((ex, idx) => (
                    <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      • {ex.exercise_name} ({ex.sets}x{ex.reps})
                    </div>
                  ))}
                  {routine.exercises && routine.exercises.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      + {routine.exercises.length - 3} ejercicios más...
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedDetailRoutine(routine)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Ver Ejercicios
                  </button>
                  <button
                    onClick={() => setActiveWorkout(routine)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Play size={15} fill="#fff" /> Iniciar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. My Custom Routines */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Dumbbell size={20} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
            Mis Rutinas Creadas ({userRoutines.length})
          </h3>
        </div>

        {userRoutines.length === 0 ? (
          <div className="glass-card flex-center" style={{ padding: '30px', flexDirection: 'column', color: 'var(--text-muted)', gap: '8px' }}>
            <p>Aún no has creado rutinas personalizadas.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={16} /> Crear mi primera rutina con plantillas
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {userRoutines.map((routine) => (
              <div key={routine.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="badge badge-secondary">{routine.type}</span>
                    <button
                      onClick={() => handleDeleteRoutine(routine.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Eliminar rutina"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '12px' }}>
                    {routine.name}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                    {routine.exercises?.map((ex, idx) => (
                      <div key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        • {ex.exercise_name} ({ex.sets}x{ex.reps})
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveWorkout(routine)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Play size={16} fill="#fff" /> Iniciar Rutina
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Workout History */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
              Historial de Entrenamientos ({workoutHistory.length})
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Registro de sesiones completadas y canceladas
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="glass-card flex-center" style={{ padding: '28px', color: 'var(--text-dim)' }}>
            No tienes entrenamientos registrados todavía.
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workoutHistory.map((item) => {
                const isCompleted = item.status !== 'CANCELADA';
                const durationMin = item.duration_seconds ? Math.max(1, Math.round(item.duration_seconds / 60)) : null;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCompleted ? 'rgba(255, 255, 255, 0.03)' : 'rgba(245, 158, 11, 0.03)',
                      border: isCompleted ? '1px solid var(--border-subtle)' : '1px solid rgba(245, 158, 11, 0.25)',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isCompleted ? '#10b981' : '#f59e0b',
                          padding: '8px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                            {item.routine?.name || 'Rutina'}
                          </span>
                          <span
                            className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.2)',
                              color: isCompleted ? '#34d399' : '#fbbf24',
                            }}
                          >
                            {isCompleted ? 'COMPLETADA' : 'CANCELADA'}
                          </span>
                          <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
                            {item.routine?.type}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                          <span>
                            📅 {new Date(item.completed_at).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })} • {new Date(item.completed_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {durationMin !== null && (
                            <span style={{ color: '#fb923c' }}>
                              ⏱️ {durationMin} min
                            </span>
                          )}

                          {item.exercises_completed !== null && item.exercises_completed !== undefined && item.total_exercises && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              💪 {item.exercises_completed}/{item.total_exercises} ejercicios
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (item.routine) {
                          setSelectedDetailRoutine(item.routine as any);
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      Repetir Rutina
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* UPGRADED MODAL: CREAR RUTINA CON PLANTILLAS Y AUTOCOMPLETADO */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Rutina Personalizada"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateRoutine} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Template Chips */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              ⚡ Cargar Plantilla Recomendada (Opcional):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUGGESTED_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: Routine Name & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Nombre de la Rutina *</label>
              <input
                type="text"
                placeholder="Ej. Glúteos y Abdomen Explosivo"
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Objetivo / Tipo</label>
              <select
                value={newRoutineType}
                onChange={(e) => setNewRoutineType(e.target.value)}
                className="select-field"
              >
                <option value="fuerza">Fuerza & Tonificación (Glúteos/Torso)</option>
                <option value="HIIT">HIIT Quema Grasa & Aceleración</option>
                <option value="cardio">Cardio Total Body</option>
                <option value="core">Cintura Esbelta & Abdomen Plano</option>
              </select>
            </div>
          </div>

          {/* Exercise List */}
          <div style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>
                Ejercicios ({newExercises.length}) — <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>Escribe o selecciona sugerencias</span>
              </label>
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              >
                <Plus size={14} /> Añadir Ejercicio
              </button>
            </div>

            {/* Exercise Column Headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 70px 70px 85px 32px',
                gap: '6px',
                padding: '0 4px',
                marginBottom: '4px',
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              <span>Nombre Ejercicio</span>
              <span style={{ textAlign: 'center' }}>Series</span>
              <span style={{ textAlign: 'center' }}>Reps</span>
              <span style={{ textAlign: 'center' }}>Desc(s)</span>
              <span></span>
            </div>

            {/* Scrollable Exercise Rows Container */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '250px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {newExercises.map((ex, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 70px 70px 85px 32px',
                    gap: '6px',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <input
                    type="text"
                    list="exercise-suggestions"
                    placeholder="Ej. Puente de Glúteos con Pausa"
                    value={ex.exercise_name}
                    onChange={(e) => handleExerciseChange(index, 'exercise_name', e.target.value)}
                    className="input-field"
                    style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="4"
                    value={ex.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))}
                    className="input-field"
                    style={{ padding: '6px 4px', textAlign: 'center', fontSize: '0.85rem' }}
                    title="Número de series"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="15"
                    value={ex.reps}
                    onChange={(e) => handleExerciseChange(index, 'reps', Number(e.target.value))}
                    className="input-field"
                    style={{ padding: '6px 4px', textAlign: 'center', fontSize: '0.85rem' }}
                    title="Repeticiones"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    step="5"
                    placeholder="45"
                    value={ex.rest_seconds}
                    onChange={(e) => handleExerciseChange(index, 'rest_seconds', Number(e.target.value))}
                    className="input-field"
                    style={{ padding: '6px 4px', textAlign: 'center', fontSize: '0.85rem' }}
                    title="Descanso en segundos"
                    required
                  />
                  <div>
                    {newExercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(index)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Eliminar fila"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <CheckCircle2 size={16} /> Guardar Rutina
            </button>
          </div>
        </form>
      </Modal>

      {/* Routine Preview Detail Modal */}
      <RoutineDetailModal
        routine={selectedDetailRoutine}
        isOpen={Boolean(selectedDetailRoutine)}
        onClose={() => setSelectedDetailRoutine(null)}
        onStart={(r) => {
          setSelectedDetailRoutine(null);
          setActiveWorkout(r);
        }}
      />
    </div>
  );
};
