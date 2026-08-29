import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import { AdminUserListItem } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Shield,
  Dumbbell,
  TrendingUp,
  Activity,
  ArrowRight,
  UserCheck,
  UserX,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string, userId?: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listUsers({ limit: 10 });
      setUsers(res.data.users);
      setTotalUsers(res.data.pagination.total);
    } catch (err: any) {
      showToast('Error cargando métricas admin', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCount = users.filter((u) => u.active).length;
  const totalWorkouts = users.reduce((sum, u) => sum + (u._count?.workout_logs || 0), 0);
  const totalPhotos = users.reduce((sum, u) => sum + (u._count?.progress_photos || 0), 0);

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">Panel de Control</span>
            <Shield size={16} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '2.4rem', color: '#fff', margin: 0 }}>
            ADMINISTRACIÓN GLOBAL
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
            Supervisa usuarios registrados, progreso físico, fotos de comidas y gestión de accesos.
          </p>
        </div>

        <button
          onClick={() => onNavigate('admin-users')}
          className="btn btn-primary"
        >
          <Users size={18} /> Gestionar Usuarios ({totalUsers})
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Total Usuarios</span>
            <Users size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '8px 0 4px 0' }}>
            {totalUsers}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Registrados en plataforma</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Usuarios Activos</span>
            <UserCheck size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', margin: '8px 0 4px 0' }}>
            {activeCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Con cuenta habilitada</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Sesiones Entrenadas</span>
            <Dumbbell size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#c084fc', margin: '8px 0 4px 0' }}>
            {totalWorkouts}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Entrenamientos finalizados</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span className="form-label">Fotos de Progreso</span>
            <Activity size={20} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', margin: '8px 0 4px 0' }}>
            {totalPhotos}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Almacenadas de forma privada</span>
        </div>
      </div>

      {/* Recent Users Table Preview */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
              Usuarios Registrados Recientemente
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Haz clic en cualquier usuario para inspeccionar su progreso en 360°
            </span>
          </div>

          <button
            onClick={() => onNavigate('admin-users')}
            className="btn btn-secondary btn-sm"
          >
            Ver Todos <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Usuario</th>
                <th style={{ padding: '12px 16px' }}>Rol</th>
                <th style={{ padding: '12px 16px' }}>Estado</th>
                <th style={{ padding: '12px 16px' }}>Entrenamientos</th>
                <th style={{ padding: '12px 16px' }}>Fotos Progreso</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease',
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-muted'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${u.active ? 'badge-success' : 'badge-muted'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#fff', fontWeight: 600 }}>
                    {u._count?.workout_logs || 0}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#38bdf8', fontWeight: 600 }}>
                    {u._count?.progress_photos || 0}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => onNavigate('admin-user-detail', u.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                      Ver Detalle 360°
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
