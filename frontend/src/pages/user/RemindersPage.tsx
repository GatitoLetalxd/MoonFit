import React, { useState, useEffect } from 'react';
import { remindersApi } from '../../api/services';
import { Reminder } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Smartphone,
  Play,
} from 'lucide-react';

export const RemindersPage: React.FC = () => {
  const { showToast, triggerReminderModal } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [newType, setNewType] = useState<string>('entrenar');
  const [newTime, setNewTime] = useState<string>('08:00');
  const [newFrequency, setNewFrequency] = useState<string>('diario');

  const loadReminders = async () => {
    try {
      setLoading(true);
      const res = await remindersApi.list();
      setReminders(res.data);
    } catch (err: any) {
      showToast('Error cargando recordatorios', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await remindersApi.create({
        type: newType,
        time: newTime,
        frequency: newFrequency,
        active: true,
      });
      showToast('¡Recordatorio Guardado!', 'La app sincronizará la alerta en el dispositivo.', 'success');
      setIsModalOpen(false);
      loadReminders();
    } catch (err: any) {
      showToast('Error al crear recordatorio', err.message, 'error');
    }
  };

  const handleToggleActive = async (reminder: Reminder) => {
    try {
      await remindersApi.update(reminder.id, { active: !reminder.active });
      showToast(`Recordatorio ${!reminder.active ? 'activado' : 'desactivado'}`, '', 'info');
      loadReminders();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteReminder = async (id: number) => {
    if (!confirm('¿Deseas eliminar este recordatorio?')) return;
    try {
      await remindersApi.delete(id);
      showToast('Recordatorio eliminado', '', 'info');
      loadReminders();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSimulateNotification = (reminder: Reminder) => {
    triggerReminderModal({
      title:
        reminder.type === 'entrenar'
          ? '¡Hora de Entrenar! 🏋️‍♂️'
          : reminder.type === 'agua'
          ? '¡Momento de Hidratarte! 💧'
          : '¡Registro de Peso Semanal! ⚖️',
      message:
        reminder.type === 'entrenar'
          ? `Son las ${reminder.time}. Tienes una sesión planificada hoy para mantenerte en forma.`
          : reminder.type === 'agua'
          ? `Recuerda beber al menos un vaso de agua fresca para mantener tu hidratación óptima.`
          : `Es lunes de pesaje. Súbete a la báscula y registra tu evolución semanal.`,
      type: reminder.type,
      originalTime: reminder.time,
    });
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
            RECORDATORIOS LOCALES
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Las notificaciones se ejecutan localmente en el dispositivo sin depender del backend.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> Nuevo Recordatorio
        </button>
      </div>

      {/* Info Card on Local Notifications */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          background: 'rgba(249, 115, 22, 0.08)',
          border: '1px solid rgba(249, 115, 22, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}
      >
        <Smartphone size={24} color="var(--color-primary)" style={{ marginTop: '2px' }} />
        <div>
          <h4 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, marginBottom: '4px' }}>
            Comportamiento en Dispositivos Android (APK)
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
            Cuando el APK se ejecuta en tu teléfono, las notificaciones se programan en el sistema operativo Android
            con botones directos de acción: <strong>Aceptar</strong> y <strong>Posponer 30 min</strong>. Haz clic en "Probar Alerta" en cualquier recordatorio para simular el comportamiento.
          </p>
        </div>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="glass-card flex-center" style={{ padding: '40px', flexDirection: 'column', color: 'var(--text-muted)', gap: '10px' }}>
          <Bell size={36} color="var(--text-dim)" />
          <p>No tienes recordatorios activos.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={16} /> Crear recordatorio
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="glass-card"
              style={{
                padding: '20px',
                opacity: reminder.active ? 1 : 0.6,
                border: reminder.active ? '1px solid var(--border-glass)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                  {reminder.type === 'entrenar' ? '💪 Entrenar' : reminder.type === 'agua' ? '💧 Agua' : '⚖️ Pesaje'}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleToggleActive(reminder)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    {reminder.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <Clock size={20} color="var(--color-primary)" />
                <span className="font-heading" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
                  {reminder.time}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({reminder.frequency})</span>
              </div>

              <button
                onClick={() => handleSimulateNotification(reminder)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', gap: '6px' }}
              >
                <Play size={14} /> Probar Alerta en Pantalla
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Reminder */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo Recordatorio"
      >
        <form onSubmit={handleCreateReminder}>
          <div className="form-group">
            <label className="form-label">Tipo de Alerta</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="select-field"
            >
              <option value="entrenar">Hora de Entrenar 💪</option>
              <option value="agua">Tomar Agua 💧</option>
              <option value="pesarse">Pesaje Semanal ⚖️</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hora</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Frecuencia</label>
            <select
              value={newFrequency}
              onChange={(e) => setNewFrequency(e.target.value)}
              className="select-field"
            >
              <option value="diario">Todos los días (Diario)</option>
              <option value="semanal">Una vez por semana</option>
              <option value="lunes_miercoles_viernes">Lunes, Miércoles y Viernes</option>
            </select>
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
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
