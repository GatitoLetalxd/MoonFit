import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Flame, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [age, setAge] = useState<string>('26');
  const [heightCm, setHeightCm] = useState<string>('175');
  const [initialWeightKg, setInitialWeightKg] = useState<string>('82.5');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Campos requeridos', 'Por favor completa nombre, email y contraseña', 'warning');
      return;
    }

    try {
      setLoading(true);
      await register({
        name,
        email,
        password,
        age: age ? Number(age) : undefined,
        height_cm: heightCm ? Number(heightCm) : undefined,
        initial_weight_kg: initialWeightKg ? Number(initialWeightKg) : undefined,
      });
      showToast('¡Cuenta Creada!', 'Bienvenido a MoonFit. Vamos a configurar tu meta.', 'success');
    } catch (err: any) {
      showToast('Error en el registro', err.response?.data?.message || err.message, 'error');
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
        background: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 60%)',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px 32px',
          background: 'rgba(17, 24, 39, 0.9)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: '16px',
            }}
          >
            <img
              src="/logo.webp"
              alt="MoonFit Logo"
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '22px',
                boxShadow: '0 0 35px rgba(139, 92, 246, 0.45), 0 0 15px rgba(6, 182, 212, 0.3)',
                display: 'block',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0, letterSpacing: '0.02em' }}>
            CREAR CUENTA
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Únete a <strong style={{ color: '#fff' }}>MoonFit</strong> y comienza tu transformación
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <div style={{ position: 'relative' }}>
              <UserIcon
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '14px', top: '14px' }}
              />
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '14px', top: '14px' }}
              />
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '14px', top: '14px' }}
              />
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Edad</label>
              <input
                type="number"
                placeholder="Años"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Altura (cm)</label>
              <input
                type="number"
                placeholder="cm"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Peso Inicial</label>
              <input
                type="number"
                step="0.1"
                placeholder="kg"
                value={initialWeightKg}
                onChange={(e) => setInitialWeightKg(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px' }}
          >
            {loading ? 'Creando cuenta...' : 'Comenzar Ahora'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Switch to Login */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            ¿Ya tienes una cuenta?{' '}
          </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};
