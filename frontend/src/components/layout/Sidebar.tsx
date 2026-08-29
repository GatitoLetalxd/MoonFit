import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  Apple,
  Target,
  Bell,
  User,
  Users,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { isAdmin } = useAuth();

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routines', label: 'Rutinas', icon: Dumbbell },
    { id: 'progress', label: 'Progreso', icon: TrendingUp },
    { id: 'nutrition', label: 'Nutrición', icon: Apple },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'reminders', label: 'Recordatorios', icon: Bell },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Panel Global', icon: ShieldAlert },
    { id: 'admin-users', label: 'Usuarios', icon: Users },
    { id: 'routines', label: 'Rutinas', icon: Dumbbell },
    { id: 'profile', label: 'Ajustes', icon: User },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <nav
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '8px 0',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.05))'
                  : 'transparent',
                border: isActive
                  ? '1px solid var(--color-primary)'
                  : '1px solid transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.95rem',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
              }}
              className="tab-button"
            >
              <Icon size={18} color={isActive ? 'var(--color-primary)' : 'currentColor'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
