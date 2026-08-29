import React, { useState, useEffect } from 'react';
import { adminApi, routinesApi } from '../../api/services';
import { AdminUserListItem, Routine } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Search,
  Key,
  Dumbbell,
  MessageSquare,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Shield,
} from 'lucide-react';

interface AdminUsersPageProps {
  onViewUserDetail: (userId: string) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ onViewUserDetail }) => {
  const { showToast, celebrate } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [availableRoutines, setAvailableRoutines] = useState<Routine[]>([]);

  // Selected User for Modals
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState<number>(1);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, routinesRes] = await Promise.all([
        adminApi.listUsers({ search: searchTerm || undefined }),
        routinesApi.list(),
      ]);
      setUsers(usersRes.data.users);
      setAvailableRoutines([
        ...routinesRes.data.predefined,
        ...routinesRes.data.userCreated,
      ]);
    } catch (err: any) {
      showToast('Error cargando usuarios', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  const handleToggleStatus = async (user: AdminUserListItem) => {
    try {
      await adminApi.toggleStatus(user.id, !user.active);
      showToast(`Usuario ${!user.active ? 'activado' : 'desactivado'}`, '', 'info');
      loadUsers();
    } catch (err: any) {
      showToast('Error al cambiar estado', err.message, 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      await adminApi.changePassword(selectedUser.id, newPassword);
      showToast('¡Contraseña Cambiada!', `Se revocaron las sesiones activas de ${selectedUser.name}.`, 'success');
      setIsPasswordModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      showToast('Error al cambiar contraseña', err.message, 'error');
    }
  };

  const handleAssignRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await adminApi.assignRoutine(selectedUser.id, Number(selectedRoutineId));
      showToast('¡Rutina Asignada!', `Se asignó la rutina al usuario ${selectedUser.name}.`, 'success');
      celebrate();
      setIsAssignModalOpen(false);
    } catch (err: any) {
      showToast('Error al asignar rutina', err.message, 'error');
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !feedbackMessage.trim()) return;

    try {
      await adminApi.sendFeedback(selectedUser.id, feedbackMessage);
      showToast('¡Feedback Enviado!', `El usuario verá tu mensaje de coaching en su dashboard.`, 'success');
      celebrate();
      setIsFeedbackModalOpen(false);
      setFeedbackMessage('');
    } catch (err: any) {
      showToast('Error al enviar feedback', err.message, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await adminApi.deleteUser(selectedUser.id);
      showToast('Usuario Eliminado', 'Se han borrado en cascada todos sus datos y fotos físicas.', 'info');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      showToast('Error al eliminar', err.message, 'error');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            GESTIÓN DE USUARIOS
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Listado completo, cambio de contraseñas, asignación de rutinas y coaching.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search
            size={18}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '14px', top: '14px' }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Usuario</th>
                <th style={{ padding: '12px 14px' }}>Rol</th>
                <th style={{ padding: '12px 14px' }}>Estado</th>
                <th style={{ padding: '12px 14px' }}>Peso/Alt</th>
                <th style={{ padding: '12px 14px' }}>Registros</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-muted'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span className={`badge ${u.active ? 'badge-success' : 'badge-muted'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {u.initial_weight_kg || '--'} kg • {u.height_cm || '--'} cm
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {u._count?.workout_logs || 0} ent. • {u._count?.progress_photos || 0} fotos • {u._count?.weekly_weight_logs || 0} pesajes
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => onViewUserDetail(u.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Ver Ficha 360°"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsPasswordModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Cambiar Contraseña"
                      >
                        <Key size={15} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsAssignModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Asignar Rutina"
                      >
                        <Dumbbell size={15} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsFeedbackModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 10px' }}
                        title="Enviar Feedback Coaching"
                      >
                        <MessageSquare size={15} />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px', color: u.active ? '#10b981' : '#ef4444' }}
                        title={u.active ? 'Desactivar cuenta' : 'Activar cuenta'}
                      >
                        {u.active ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsDeleteModalOpen(true);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '6px', color: '#ef4444' }}
                        title="Eliminar usuario definitivamente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Change Password */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setNewPassword('');
        }}
        title={`Cambiar Contraseña: ${selectedUser?.name}`}
      >
        <form onSubmit={handleChangePassword}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Al cambiar la contraseña desde el panel, todas las sesiones activas del usuario serán revocadas automáticamente.
          </p>

          <div className="form-group">
            <label className="form-label">Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Actualizar Contraseña
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Routine */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Asignar Rutina a ${selectedUser?.name}`}
      >
        <form onSubmit={handleAssignRoutine}>
          <div className="form-group">
            <label className="form-label">Seleccionar Rutina a Asignar</label>
            <select
              value={selectedRoutineId}
              onChange={(e) => setSelectedRoutineId(Number(e.target.value))}
              className="select-field"
            >
              {availableRoutines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type}) — {r.exercises?.length || 0} ejercicios
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Asignar Rutina
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Send Feedback */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setFeedbackMessage('');
        }}
        title={`Enviar Mensaje / Feedback a ${selectedUser?.name}`}
      >
        <form onSubmit={handleSendFeedback}>
          <div className="form-group">
            <label className="form-label">Mensaje de Coaching</label>
            <textarea
              placeholder="Ej. ¡Excelente registro de peso esta semana! Recuerda enfocarte en la hidratación y descanso."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="textarea-field"
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Enviar Feedback
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete User */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`¿Eliminar usuario ${selectedUser?.name}?`}
      >
        <div>
          <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '20px' }}>
            ⚠️ <strong>Atención:</strong> Esta acción borrará permanentemente la cuenta de{' '}
            <strong>{selectedUser?.email}</strong>, sus fotos de progreso y comidas en disco, y todos sus registros en cascada.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteUser}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              Eliminar Definitivamente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
