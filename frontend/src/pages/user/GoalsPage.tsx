import React, { useState, useEffect } from 'react';
import { goalsApi } from '../../api/services';
import { Goal, GoalStatus } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { showToast, celebrate } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [targetWeight, setTargetWeight] = useState<string>('75.0');
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.list();
      setGoals(res.data);
    } catch (err: any) {
      showToast('Error cargando metas', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await goalsApi.create({
        target_weight_kg: Number(targetWeight),
        target_date: targetDate,
      });
      showToast('¡Meta Creada!', 'Tu objetivo ha sido fijado. ¡Vamos a por ello!', 'success');
      celebrate();
      setIsModalOpen(false);
      loadGoals();
    } catch (err: any) {
      showToast('Error al crear meta', err.message, 'error');
    }
  };

  const handleUpdateStatus = async (goalId: number, status: GoalStatus) => {
    try {
      await goalsApi.update(goalId, { status });
      showToast(`Meta marcada como ${status.toLowerCase()}`, '', 'info');
      if (status === 'CUMPLIDA') celebrate();
      loadGoals();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm('¿Deseas eliminar esta meta?')) return;
    try {
      await goalsApi.delete(goalId);
      showToast('Meta eliminada', '', 'info');
      loadGoals();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
            METAS & OBJETIVOS
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Fija tus metas de peso y monitorea tu progreso porcentual.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> Nueva Meta
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="glass-card flex-center" style={{ padding: '40px', flexDirection: 'column', color: 'var(--text-muted)', gap: '10px' }}>
          <Target size={36} color="var(--text-dim)" />
          <p>No tienes metas activas registradas.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={16} /> Definir mi primera meta
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {goals.map((goal) => {
            const percent = goal.progress_percentage || 0;
            const isCompleted = goal.status === 'CUMPLIDA';

            return (
              <div
                key={goal.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  border: isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                {/* Status & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span
                    className={`badge ${
                      goal.status === 'ACTIVA'
                        ? 'badge-primary'
                        : goal.status === 'CUMPLIDA'
                        ? 'badge-success'
                        : 'badge-muted'
                    }`}
                  >
                    {goal.status}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {goal.status === 'ACTIVA' && (
                      <button
                        onClick={() => handleUpdateStatus(goal.id, 'CUMPLIDA')}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#10b981', padding: '4px' }}
                        title="Marcar como cumplida"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444', padding: '4px' }}
                      title="Eliminar meta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Target Weight */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Peso Objetivo
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
                    {goal.target_weight_kg}{' '}
                    <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>kg</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Avance Real</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{percent}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: isCompleted
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : 'linear-gradient(90deg, var(--color-primary), #fb923c)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Info row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} />
                    <span>
                      Fecha límite:{' '}
                      {new Date(goal.target_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Goal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Meta"
      >
        <form onSubmit={handleCreateGoal}>
          <div className="form-group">
            <label className="form-label">Peso Objetivo (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ej. 74.5"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha Estimada Objetivo</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Guardar Meta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
