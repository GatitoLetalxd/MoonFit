import React, { createContext, useContext, useState } from 'react';
import confetti from 'canvas-confetti';
import { Bell, CheckCircle2, AlertCircle, Info, X, Clock } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

export interface ActiveReminderModal {
  id: string;
  title: string;
  message: string;
  type: 'entrenar' | 'agua' | 'pesarse' | string;
  originalTime?: string;
}

interface NotificationContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  triggerReminderModal: (reminder: Omit<ActiveReminderModal, 'id'>) => void;
  celebrate: () => void;
  playTone: (type: 'beep' | 'success' | 'start') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeReminder, setActiveReminder] = useState<ActiveReminderModal | null>(null);

  const showToast = (title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerReminderModal = (reminder: Omit<ActiveReminderModal, 'id'>) => {
    playTone('beep');
    setActiveReminder({
      ...reminder,
      id: Math.random().toString(36).substring(2, 9),
    });
  };

  const celebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#10b981', '#8b5cf6', '#38bdf8', '#fbbf24'],
    });
  };

  const playTone = (type: 'beep' | 'success' | 'start') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'start') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const handleAcceptReminder = () => {
    showToast('¡Acción Registrada!', 'Has respondido positivamente a tu recordatorio local.', 'success');
    celebrate();
    setActiveReminder(null);
  };

  const handlePostponeReminder = () => {
    showToast(
      'Recordatorio Pospuesto (+30 min)',
      'Tu notificación local ha sido reprogramada automáticamente 30 minutos más tarde.',
      'warning'
    );
    setActiveReminder(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        triggerReminderModal,
        celebrate,
        playTone,
      }}
    >
      {children}

      {/* Toast Stack */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(17, 24, 39, 0.95)',
              border: `1px solid ${
                toast.type === 'success'
                  ? 'rgba(16, 185, 129, 0.4)'
                  : toast.type === 'error'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : toast.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(255, 255, 255, 0.15)'
              }`,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ marginTop: '2px' }}>
              {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
              {toast.type === 'error' && <AlertCircle size={20} color="#ef4444" />}
              {toast.type === 'warning' && <Clock size={20} color="#f59e0b" />}
              {toast.type === 'info' && <Info size={20} color="#38bdf8" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Local Reminder Modal Simulator */}
      {activeReminder && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          maxWidth: '460px',
          width: '92%',
          pointerEvents: 'auto',
        }} className="animate-fade-in">
          <div className="glass-panel" style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid var(--color-primary)',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px var(--color-primary-glow)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                background: 'rgba(249, 115, 22, 0.2)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-primary)',
                display: 'flex',
              }}>
                <Bell size={22} className="animate-pulse" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Notificación Local Android (Simulada)
                </div>
                <h4 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                  {activeReminder.title}
                </h4>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '18px', lineHeight: 1.4 }}>
              {activeReminder.message}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={handlePostponeReminder}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Clock size={16} /> Posponer 30m
              </button>
              <button
                onClick={handleAcceptReminder}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} /> Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
