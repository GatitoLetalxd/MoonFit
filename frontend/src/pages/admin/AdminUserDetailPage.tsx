import React, { useState, useEffect } from 'react';
import { adminApi, progressApi, nutritionApi } from '../../api/services';
import { AdminUserDetail } from '../../types';
import { WeightChart } from '../../components/progress/WeightChart';
import { useAuthenticatedImage } from '../../utils/useAuthImage';
import { useNotification } from '../../context/NotificationContext';
import {
  ArrowLeft,
  User,
  Camera,
  Utensils,
  Dumbbell,
  MessageSquare,
  Send,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  TrendingUp,
} from 'lucide-react';

interface AdminUserDetailProps {
  userId: string;
  onBack: () => void;
}

const PhotoItem: React.FC<{ photoId: string; date: string }> = ({ photoId, date }) => {
  const { src, loading } = useAuthenticatedImage(progressApi.getPhotoViewUrl(photoId));

  return (
    <div
      className="glass-card"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        height: '200px',
        position: 'relative',
      }}
    >
      {src ? (
        <img
          src={src}
          alt="Foto de progreso"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          {loading ? 'Cargando imagen...' : 'Foto privada'}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          insetInline: 0,
          padding: '6px 10px',
          background: 'rgba(0,0,0,0.75)',
          fontSize: '0.75rem',
          color: '#fff',
        }}
      >
        {new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
      </div>
    </div>
  );
};

export const AdminUserDetailPage: React.FC<AdminUserDetailProps> = ({ userId, onBack }) => {
  const { showToast, celebrate } = useNotification();
  const [loading, setLoading] = useState<boolean>(true);
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUserDetail(userId);
      setUserDetail(res.data);
    } catch (err: any) {
      showToast('Error cargando detalle de usuario', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    try {
      await adminApi.sendFeedback(userId, feedbackMessage);
      showToast('¡Feedback Enviado!', 'El usuario podrá verlo en su dashboard.', 'success');
      celebrate();
      setFeedbackMessage('');
      loadUser();
    } catch (err: any) {
      showToast('Error al enviar feedback', err.message, 'error');
    }
  };

  if (loading || !userDetail) {
    return (
      <div className="container flex-center" style={{ padding: '60px', color: 'var(--text-muted)' }}>
        Cargando ficha 360° del usuario...
      </div>
    );
  }

  const activeGoal = userDetail.goals?.find((g) => g.status === 'ACTIVA') || userDetail.goals?.[0];

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Back Navigation */}
      <div>
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', gap: '6px' }}
        >
          <ArrowLeft size={16} /> Volver a Lista de Usuarios
        </button>
      </div>

      {/* User Header Profile Card */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(139, 92, 246, 0.08))',
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
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {userDetail.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: 0 }}>{userDetail.name}</h2>
              <span className={`badge ${userDetail.active ? 'badge-success' : 'badge-muted'}`}>
                {userDetail.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{userDetail.email}</span>
          </div>
        </div>

        {/* User Key Metrics */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '10px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EDAD</span>
            <div style={{ fontWeight: 700, color: '#fff' }}>{userDetail.age || '--'} años</div>
          </div>
          <div className="glass-card" style={{ padding: '10px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ALTURA</span>
            <div style={{ fontWeight: 700, color: '#fff' }}>{userDetail.height_cm || '--'} cm</div>
          </div>
          <div className="glass-card" style={{ padding: '10px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>PESO INICIAL</span>
            <div style={{ fontWeight: 700, color: '#fff' }}>{userDetail.initial_weight_kg || '--'} kg</div>
          </div>
          {activeGoal && (
            <div className="glass-card" style={{ padding: '10px 16px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981' }}>META ACTIVA</span>
              <div style={{ fontWeight: 700, color: '#10b981' }}>{activeGoal.target_weight_kg} kg</div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Weight Evolution Chart */}
      <section>
        <WeightChart
          logs={userDetail.weekly_weight_logs || []}
          initialWeight={userDetail.initial_weight_kg}
          targetWeight={activeGoal?.target_weight_kg}
        />
      </section>

      {/* 2. Private Progress Photos (Protected Streaming) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>
              Fotos de Progreso ({userDetail.progress_photos?.length || 0})
            </h3>
          </div>
          <span className="badge badge-primary">🔒 Visor de Admin Autenticado</span>
        </div>

        {(!userDetail.progress_photos || userDetail.progress_photos.length === 0) ? (
          <div className="glass-card flex-center" style={{ padding: '24px', color: 'var(--text-dim)' }}>
            El usuario no ha subido fotos de progreso todavía.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
            {userDetail.progress_photos.map((p) => (
              <PhotoItem key={p.id} photoId={p.id} date={p.taken_at} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Meals Log & Photos */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Utensils size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>
            Comidas Registradas ({userDetail.meals?.length || 0})
          </h3>
        </div>

        {(!userDetail.meals || userDetail.meals.length === 0) ? (
          <div className="glass-card flex-center" style={{ padding: '24px', color: 'var(--text-dim)' }}>
            Sin registros de comidas.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {userDetail.meals.map((meal) => (
              <div key={meal.id} className="glass-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-success">{meal.meal_type || 'Comida'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(meal.logged_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0 }}>
                  {meal.description || 'Comida registrada sin descripción'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Workout Logs & Adherence History */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dumbbell size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>
              Historial de Entrenamientos y Adherencia ({userDetail.workout_logs?.length || 0})
            </h3>
          </div>
          <span className="badge badge-primary">Auditoría de Sesiones</span>
        </div>

        {/* Adherence KPI Summary */}
        {userDetail.workout_logs && userDetail.workout_logs.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TOTAL SESIONES</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                {userDetail.workout_logs.length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981' }}>COMPLETADAS</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
                {userDetail.workout_logs.filter((w) => w.status !== 'CANCELADA').length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px', textAlign: 'center', background: 'rgba(245, 158, 11, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>CANCELADAS</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
                {userDetail.workout_logs.filter((w) => w.status === 'CANCELADA').length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>TASA FINALIZACIÓN</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {Math.round(
                  (userDetail.workout_logs.filter((w) => w.status !== 'CANCELADA').length /
                    userDetail.workout_logs.length) *
                    100
                )}
                %
              </div>
            </div>
          </div>
        )}

        {(!userDetail.workout_logs || userDetail.workout_logs.length === 0) ? (
          <div className="glass-card flex-center" style={{ padding: '24px', color: 'var(--text-dim)' }}>
            El usuario no ha registrado sesiones de entrenamiento todavía.
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userDetail.workout_logs.map((log) => {
                const isCompleted = log.status !== 'CANCELADA';
                const durationMin = log.duration_seconds ? Math.max(1, Math.round(log.duration_seconds / 60)) : null;

                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCompleted ? 'rgba(255, 255, 255, 0.03)' : 'rgba(245, 158, 11, 0.04)',
                      border: isCompleted ? '1px solid var(--border-subtle)' : '1px solid rgba(245, 158, 11, 0.25)',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isCompleted ? '#10b981' : '#f59e0b',
                          padding: '6px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isCompleted ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                            {log.routine?.name || 'Rutina'}
                          </span>
                          <span
                            className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.2)',
                              color: isCompleted ? '#34d399' : '#fbbf24',
                            }}
                          >
                            {isCompleted ? 'COMPLETADA' : 'CANCELADA'}
                          </span>
                          <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                            {log.routine?.type}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '0.75rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                          <span>
                            📅 {new Date(log.completed_at).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })} • {new Date(log.completed_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {durationMin !== null && (
                            <span style={{ color: '#fb923c' }}>
                              ⏱️ {durationMin} min
                            </span>
                          )}

                          {log.exercises_completed !== null && log.exercises_completed !== undefined && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              💪 {log.exercises_completed}/{log.total_exercises || 5} ejercicios
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 5. Coaching Messages Form & History */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <MessageSquare size={20} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>
            Feedback de Coaching para el Usuario
          </h3>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <form onSubmit={handleSendFeedback} style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Escribir Mensaje al Usuario</label>
              <textarea
                placeholder="Escribe comentarios, felicitaciones o recomendaciones sobre su progreso..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="textarea-field"
                rows={3}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={16} /> Enviar Mensaje
            </button>
          </form>

          {userDetail.received_feedback && userDetail.received_feedback.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Historial de Feedback Enviado
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {userDetail.received_feedback.map((fb) => (
                  <div
                    key={fb.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>"{fb.message}"</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      Enviado el {new Date(fb.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
