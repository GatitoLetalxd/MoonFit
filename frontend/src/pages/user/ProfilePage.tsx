import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/services';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  User,
  Mail,
  Shield,
  Calendar,
  AlertTriangle,
  Trash2,
  Save,
  Camera,
  Loader2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile, logout } = useAuth();
  const { showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>(user?.name || '');
  const [age, setAge] = useState<string>(String(user?.age || ''));
  const [heightCm, setHeightCm] = useState<string>(String(user?.height_cm || ''));
  const [initialWeightKg, setInitialWeightKg] = useState<string>(String(user?.initial_weight_kg || ''));

  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>('');

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Formato no válido', 'Por favor selecciona un archivo de imagen (JPG, PNG, WEBP)', 'warning');
      return;
    }

    try {
      setUploadingAvatar(true);
      showToast('Subiendo foto...', 'El backend está optimizando y comprimiendo la imagen con Sharp.', 'info');
      await usersApi.uploadAvatar(file);
      setAvatarTimestamp(Date.now());
      await refreshProfile();
      showToast('¡Foto Guardada!', 'Tu foto de perfil ha sido actualizada y comprimida exitosamente.', 'success');
    } catch (err: any) {
      showToast('Error al subir foto', err.message, 'error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await usersApi.updateProfile({
        name,
        age: age ? Number(age) : undefined,
        height_cm: heightCm ? Number(heightCm) : undefined,
        initial_weight_kg: initialWeightKg ? Number(initialWeightKg) : undefined,
      });
      showToast('¡Perfil Actualizado!', 'Tus datos se han guardado exitosamente.', 'success');
      await refreshProfile();
    } catch (err: any) {
      showToast('Error al actualizar', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'ELIMINAR') {
      showToast('Texto de confirmación incorrecto', 'Escribe ELIMINAR para confirmar', 'warning');
      return;
    }

    try {
      setLoading(true);
      await usersApi.deleteMyAccount();
      showToast('Cuenta eliminada', 'Todos tus datos y fotos han sido borrados permanentemente.', 'info');
      await logout();
    } catch (err: any) {
      showToast('Error al eliminar cuenta', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0 }}>
          MI PERFIL & AJUSTES
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Gestiona tu información personal, foto de perfil y preferencias de cuenta.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          {/* Avatar Upload Container */}
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileSelect}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#fff',
                border: '3px solid var(--color-primary)',
                cursor: 'pointer',
                position: 'relative',
                padding: 0,
                overflow: 'hidden',
              }}
              title="Haz clic para cambiar foto de perfil"
            >
              {user?.avatar_url && user?.id ? (
                <img
                  src={`${usersApi.getAvatarUrl(user.id)}?t=${avatarTimestamp}`}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to letter if error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}

              {uploadingAvatar && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Loader2 size={24} className="animate-spin" color="#fff" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #111827',
                cursor: 'pointer',
              }}
              title="Cambiar foto"
            >
              <Camera size={13} />
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>{user?.name}</h3>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 0',
                display: 'block',
                marginTop: '2px',
              }}
            >
              {uploadingAvatar ? 'Optimizando con Sharp...' : 'Cambiar foto de perfil 📷'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span className="badge badge-primary">{user?.role}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Edad</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Altura (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Peso Inicial (kg)</label>
              <input
                type="number"
                step="0.1"
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
            style={{ marginTop: '12px' }}
          >
            <Save size={18} /> Guardar Cambios
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <AlertTriangle size={22} color="#ef4444" />
          <h3 style={{ fontSize: '1.2rem', color: '#fca5a5', margin: 0 }}>
            Zona de Peligro — Eliminación de Cuenta
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Esta acción es <strong>permanente e irreversible</strong>. Al confirmar, se eliminarán en cascada todos tus
          registros de peso, medidas corporales, fotos de progreso privadas, comidas, entrenamientos, recordatorios y metas.
        </p>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="btn btn-danger btn-sm"
        >
          <Trash2 size={16} /> Eliminar Mi Cuenta Definitivamente
        </button>
      </div>

      {/* Modal: Confirm Delete Account */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteConfirmationText('');
        }}
        title="¿Eliminar Cuenta Permanentemente?"
      >
        <div>
          <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '16px' }}>
            ⚠️ <strong>Advertencia:</strong> Se borrarán todos tus datos asociados sin posibilidad de recuperación.
            Para confirmar, escribe <strong>ELIMINAR</strong> en el siguiente campo:
          </p>

          <input
            type="text"
            placeholder="Escribe ELIMINAR"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            className="input-field"
            style={{ marginBottom: '20px' }}
          />

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
              onClick={handleDeleteAccount}
              disabled={deleteConfirmationText !== 'ELIMINAR' || loading}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              {loading ? 'Eliminando...' : 'Confirmar y Borrar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
