import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Flame, Bell, Shield, User as UserIcon, LogOut, ArrowRightLeft } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAdmin, logout, loginAsAdminShortcut } = useAuth();
  const { triggerReminderModal, showToast } = useNotification();

  const handleTestNotification = () => {
    triggerReminderModal({
      title: '¡Hora de tu Entrenamiento! 💪',
      message: 'Tienes programada tu rutina de Fuerza Total para hoy. ¿Comenzar ahora o posponer?',
      type: 'entrenar',
    });
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 14, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand */}
        <div
          onClick={() => setCurrentTab(isAdmin ? 'admin-dashboard' : 'dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <img
            src="/logo-sm.webp"
            alt="MoonFit"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'block',
            }}
          />
          <div>
            <span
              className="font-heading"
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MOON<span style={{ color: 'var(--color-primary)', WebkitTextFillColor: 'var(--color-primary)' }}>FIT</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Simulate Reminder Test Button */}
          <button
            onClick={handleTestNotification}
            className="btn btn-secondary btn-sm"
            title="Simular disparo de recordatorio local"
            style={{
              display: 'none',
              background: 'rgba(249, 115, 22, 0.1)',
              borderColor: 'rgba(249, 115, 22, 0.3)',
              color: '#fb923c',
            }}
            id="btn-simulate-reminder"
          >
            <Bell size={15} />
            <span style={{ fontSize: '0.85rem' }}>Probar Notificación</span>
          </button>

          {/* Role Indicator & Switch Shortcut */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAdmin ? (
                <div className="badge badge-primary" style={{ padding: '6px 12px' }}>
                  <Shield size={13} />
                  <span>Panel Admin</span>
                </div>
              ) : (
                <div className="badge badge-secondary" style={{ padding: '6px 12px' }}>
                  <UserIcon size={13} />
                  <span>Modo Usuario</span>
                </div>
              )}

              {/* Shortcut to toggle Admin testing if logged in as user */}
              {!isAdmin && (
                <button
                  onClick={async () => {
                    try {
                      await loginAsAdminShortcut();
                      showToast('Sesión cambiada a Administrador', 'Acceso al panel de control concedido', 'success');
                      setCurrentTab('admin-dashboard');
                    } catch (e: any) {
                      showToast('Error', e.message, 'error');
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  title="Cambiar rápidamente a sesión de Administrador para pruebas"
                >
                  <ArrowRightLeft size={13} /> Switch Admin
                </button>
              )}
            </div>
          )}

          {/* User Profile & Logout */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => setCurrentTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isAdmin ? 'var(--color-primary)' : 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    overflow: 'hidden',
                    border: '1.5px solid var(--color-primary)',
                  }}
                >
                  {user.avatar_url && user.id ? (
                    <img
                      src={`/api/users/${user.id}/avatar`}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
              </div>

              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
                title="Cerrar Sesión"
                style={{ padding: '8px' }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
