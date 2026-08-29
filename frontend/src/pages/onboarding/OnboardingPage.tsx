import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { usersApi, progressApi } from '../../api/services';
import {
  User,
  Target,
  Camera,
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Flame,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast, celebrate } = useNotification();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [age, setAge] = useState<number>(user?.age || 26);
  const [heightCm, setHeightCm] = useState<number>(user?.height_cm || 175);
  const [initialWeightKg, setInitialWeightKg] = useState<number>(user?.initial_weight_kg || 82.5);

  const [targetWeightKg, setTargetWeightKg] = useState<number>(75.0);
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [reminderTime, setReminderTime] = useState<string>('07:30');
  const [reminderType, setReminderType] = useState<string>('entrenar');

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);

      // 1. Complete onboarding in backend
      await usersApi.completeOnboarding({
        age: Number(age),
        height_cm: Number(heightCm),
        initial_weight_kg: Number(initialWeightKg),
        target_weight_kg: Number(targetWeightKg),
        target_date: targetDate,
        reminder_time: reminderTime,
        reminder_type: reminderType,
      });

      // 2. Upload initial progress photo if selected
      if (photoFile) {
        try {
          await progressApi.uploadPhoto(photoFile);
        } catch (photoErr) {
          console.error('Error uploading initial photo:', photoErr);
        }
      }

      celebrate();
      showToast('🎉 ¡Todo Listo!', 'Tu plan personalizado está configurado. ¡A darlo todo!', 'success');
      await refreshProfile();
    } catch (err: any) {
      showToast('Error al completar onboarding', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-center"
      style={{
        minHeight: '100vh',
        padding: '24px',
        background: 'radial-gradient(circle at 50% 20%, rgba(249, 115, 22, 0.12) 0%, transparent 65%)',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '36px 32px',
          background: 'rgba(17, 24, 39, 0.92)',
        }}
      >
        {/* Wizard Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.webp"
            alt="MoonFit Logo"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          />
          <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0 }}>
            CONFIGURA TU PLAN
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Paso {step} de 4 • Personalizando tu experiencia
          </p>

          {/* Stepper Progress Bar */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  background:
                    s <= step
                      ? 'linear-gradient(90deg, var(--color-primary), #fb923c)'
                      : 'rgba(255, 255, 255, 0.1)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Datos Básicos */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
                <User size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>Tus Medidas Actuales</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Servirán como punto de partida para medir tu evolución.</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Edad (Años)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Altura (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Peso Actual Inicial (kg)</label>
              <input
                type="number"
                step="0.1"
                value={initialWeightKg}
                onChange={(e) => setInitialWeightKg(Number(e.target.value))}
                className="input-field"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              Siguiente: Definir Meta <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Meta Principal */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#10b981' }}>
                <Target size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>Tu Objetivo Principal</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>¿A qué peso deseas llegar y en qué fecha estimada?</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Peso Objetivo (kg)</label>
              <input
                type="number"
                step="0.1"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Estimada para Alcanzarlo</label>
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
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ArrowLeft size={18} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                Siguiente: Foto Inicial <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Primera Foto (Opcional) */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#8b5cf6' }}>
                <Camera size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>Foto de Progreso Inicial</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>100% privada y segura. Servirá para tu comparativa Antes/Después.</p>
              </div>
            </div>

            <div
              className="glass-card flex-center"
              style={{
                height: '200px',
                border: '2px dashed var(--border-glass)',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
              onClick={() => document.getElementById('onboarding-photo-input')?.click()}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <>
                  <Camera size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                    Seleccionar Foto de Inicio
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    JPG, PNG o WEBP (Opcional)
                  </span>
                </>
              )}
              <input
                type="file"
                id="onboarding-photo-input"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ArrowLeft size={18} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {photoFile ? 'Guardar y Continuar' : 'Omitir por ahora'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Primer Recordatorio */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '10px', borderRadius: 'var(--radius-sm)', color: '#f59e0b' }}>
                <Bell size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>Recordatorios de Hábito</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Se programarán localmente en tu dispositivo para mantener la constancia.</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Recordatorio</label>
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value)}
                className="select-field"
              >
                <option value="entrenar">Hora de Entrenar 💪</option>
                <option value="agua">Tomar Agua 💧</option>
                <option value="pesarse">Pesaje Semanal ⚖️</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Hora Diaria</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ArrowLeft size={18} /> Atrás
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {loading ? 'Finalizando...' : <><CheckCircle2 size={18} /> Entrar al Dashboard</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
