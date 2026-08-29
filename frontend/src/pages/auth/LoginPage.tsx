import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Flame, Lock, Mail, ArrowRight, Shield, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<AuthPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Campos requeridos', 'Por favor ingresa tu correo y contraseña', 'warning');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('¡Bienvenido!', 'Has iniciado sesión correctamente', 'success');
    } catch (err: any) {
      showToast('Error al iniciar sesión', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setEmail('rogeeromontufar@gmail.com');
    setPassword('password');
  };

  return (
    <div
      className="flex-center"
      style={{
        minHeight: '100vh',
        padding: '24px',
        background: 'radial-gradient(circle at 50% 30%, rgba(249, 115, 22, 0.12) 0%, transparent 60%)',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          background: 'rgba(17, 24, 39, 0.88)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
                boxShadow: '0 0 35px rgba(6, 182, 212, 0.45), 0 0 15px rgba(249, 115, 22, 0.3)',
                display: 'block',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }}
            />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0, letterSpacing: '0.02em' }}>
            INICIAR SESIÓN
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Accede a tu cuenta de <strong style={{ color: '#fff' }}>MoonFit</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px' }}
          >
            {loading ? 'Ingresando...' : 'Entrar a MoonFit'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Quick Fills */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase' }}>
            Acceso Rápido para Pruebas
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.85rem', display: 'flex', gap: '6px', justifyContent: 'center' }}
            >
              <Shield size={14} color="#f97316" /> Rellenar credenciales Admin
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            ¿No tienes cuenta?{' '}
          </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};
