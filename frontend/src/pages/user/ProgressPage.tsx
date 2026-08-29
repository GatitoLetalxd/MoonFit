import React, { useState, useEffect } from 'react';
import { progressApi } from '../../api/services';
import { WeeklyWeightLog, BodyMeasurement, ProgressPhoto } from '../../types';
import { WeightChart } from '../../components/progress/WeightChart';
import { BeforeAfterComparator } from '../../components/progress/BeforeAfterComparator';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useAuthenticatedImage } from '../../utils/useAuthImage';
import {
  TrendingDown,
  Camera,
  Ruler,
  Plus,
  Trash2,
  Calendar,
  BarChart3,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
} from 'lucide-react';

const PhotoThumbnail: React.FC<{ photo: ProgressPhoto; onDelete: (id: string) => void }> = ({
  photo,
  onDelete,
}) => {
  const { src, loading } = useAuthenticatedImage(progressApi.getPhotoViewUrl(photo.id));

  return (
    <div
      className="glass-card"
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        height: '220px',
      }}
    >
      {src ? (
        <img
          src={src}
          alt="Progreso"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-dim)' }}>
          {loading ? 'Cargando foto...' : 'No disponible'}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          insetInline: 0,
          padding: '8px 12px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: '#f8fafc', fontWeight: 600 }}>
          {new Date(photo.taken_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        <button
          onClick={() => onDelete(photo.id)}
          style={{
            background: 'rgba(239, 68, 68, 0.3)',
            border: 'none',
            color: '#fca5a5',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
          }}
          title="Eliminar foto"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast, celebrate } = useNotification();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'photos' | 'measurements'>('chart');

  const [weightLogs, setWeightLogs] = useState<WeeklyWeightLog[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);

  // Modals
  const [isWeightModalOpen, setIsWeightModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState<boolean>(false);

  // Forms - Integrated Weekly Check-in
  const [newWeight, setNewWeight] = useState<string>('');
  const [newWeightNotes, setNewWeightNotes] = useState<string>('');
  const [newWeightDate, setNewWeightDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newCheckinPhoto, setNewCheckinPhoto] = useState<File | null>(null);
  const [newCheckinPhotoPreview, setNewCheckinPhotoPreview] = useState<string | null>(null);
  const [newCheckinWaist, setNewCheckinWaist] = useState<string>('');
  const [newCheckinArm, setNewCheckinArm] = useState<string>('');

  // Standalone Photo Upload Modal State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Standalone Measurements State
  const [newWaist, setNewWaist] = useState<string>('');
  const [newArm, setNewArm] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [weightRes, measureRes, photosRes] = await Promise.all([
        progressApi.getWeightHistory(),
        progressApi.getMeasurementsHistory(),
        progressApi.listPhotos(),
      ]);
      setWeightLogs(weightRes.data);
      setMeasurements(measureRes.data);
      setPhotos(photosRes.data);
    } catch (err: any) {
      showToast('Error cargando progreso', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveIntegratedCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) {
      showToast('Peso requerido', 'Ingresa tu peso en kg', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Log weight
      await progressApi.logWeight({
        weight_kg: Number(newWeight),
        notes: newWeightNotes || undefined,
        date: newWeightDate,
      });

      // 2. Upload photo if selected
      if (newCheckinPhoto) {
        try {
          await progressApi.uploadPhoto(newCheckinPhoto);
        } catch (photoErr: any) {
          console.error('Error uploading checkin photo:', photoErr);
        }
      }

      // 3. Log measurements if provided
      if (newCheckinWaist || newCheckinArm) {
        try {
          await progressApi.logMeasurements({
            waist_cm: newCheckinWaist ? Number(newCheckinWaist) : undefined,
            arm_cm: newCheckinArm ? Number(newCheckinArm) : undefined,
          });
        } catch (measureErr: any) {
          console.error('Error saving checkin measurements:', measureErr);
        }
      }

      showToast('¡Registro Semanal Guardado!', 'Se actualizó tu peso, foto y medidas exitosamente.', 'success');
      celebrate();
      setIsWeightModalOpen(false);

      // Reset fields
      setNewWeight('');
      setNewWeightNotes('');
      setNewCheckinPhoto(null);
      setNewCheckinPhotoPreview(null);
      setNewCheckinWaist('');
      setNewCheckinArm('');

      loadData();
    } catch (err: any) {
      showToast('Error al guardar registro semanal', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await progressApi.logMeasurements({
        waist_cm: newWaist ? Number(newWaist) : undefined,
        arm_cm: newArm ? Number(newArm) : undefined,
      });
      showToast('Medidas registradas', '', 'success');
      setIsMeasureModalOpen(false);
      setNewWaist('');
      setNewArm('');
      loadData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast('Archivo requerido', 'Selecciona una imagen', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await progressApi.uploadPhoto(uploadFile);
      showToast('¡Foto subida con éxito!', 'Se almacena de forma privada y protegida.', 'success');
      celebrate();
      setIsPhotoModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      loadData();
    } catch (err: any) {
      showToast('Error al subir foto', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta foto de progreso?')) return;
    try {
      await progressApi.deletePhoto(photoId);
      showToast('Foto eliminada', '', 'info');
      loadData();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Quick Action Buttons */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(139, 92, 246, 0.08))',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">Evolución Corporal</span>
            <TrendingDown size={16} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0 }}>
            SEGUIMIENTO DE PROGRESO FÍSICO
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Registra tu pesaje semanal (lunes), fotos privadas de progreso y medidas corporales.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="btn btn-primary"
            style={{ boxShadow: '0 0 20px var(--color-primary-glow)' }}
          >
            <Plus size={18} /> Registrar Peso + Foto
          </button>
          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="btn btn-secondary"
          >
            <Camera size={18} /> Subir Solo Foto
          </button>
          <button
            onClick={() => setIsMeasureModalOpen(true)}
            className="btn btn-secondary"
          >
            <Ruler size={18} /> Registrar Medidas
          </button>
        </div>
      </div>

      {/* Sub-Tabs View Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('chart')}
          className={`btn btn-sm ${activeTab === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BarChart3 size={16} /> Gráfica de Peso ({weightLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`btn btn-sm ${activeTab === 'photos' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ImageIcon size={16} /> Fotos & Comparador ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab('measurements')}
          className={`btn btn-sm ${activeTab === 'measurements' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Ruler size={16} /> Medidas ({measurements.length})
        </button>
      </div>

      {/* TAB 1: Chart & Weight Evolution */}
      {activeTab === 'chart' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <WeightChart
            logs={weightLogs}
            initialWeight={user?.initial_weight_kg}
          />

          {/* Quick Logs Summary */}
          {weightLogs.length > 0 && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>
                Historial de Pesajes Registrados
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {weightLogs.slice().reverse().map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                      Semana: {new Date(log.week_start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '2px' }}>
                      {log.weight_kg} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
                    </div>
                    {log.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Photos & Before / After Comparator */}
      {activeTab === 'photos' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Comparator */}
          <BeforeAfterComparator
            photos={photos}
            onUploadClick={() => setIsPhotoModalOpen(true)}
          />

          {/* Photos Gallery */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                  Galería de Fotos de Progreso ({photos.length})
                </h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} /> Subir Nueva Foto
              </button>
            </div>

            {photos.length === 0 ? (
              <div className="glass-card flex-center" style={{ padding: '36px', flexDirection: 'column', color: 'var(--text-muted)', gap: '10px' }}>
                <Camera size={36} color="var(--text-dim)" />
                <p>Aún no has subido fotos de progreso.</p>
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} /> Subir mi primera foto
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {photos.map((p) => (
                  <PhotoThumbnail key={p.id} photo={p} onDelete={handleDeletePhoto} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: Measurements */}
      {activeTab === 'measurements' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
              Medidas Corporales Registradas ({measurements.length})
            </h3>
            <button
              onClick={() => setIsMeasureModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} /> Registrar Medidas
            </button>
          </div>

          {measurements.length === 0 ? (
            <div className="glass-card flex-center" style={{ padding: '36px', flexDirection: 'column', color: 'var(--text-muted)', gap: '10px' }}>
              <Ruler size={36} color="var(--text-dim)" />
              <p>No tienes medidas corporales registradas.</p>
              <button
                onClick={() => setIsMeasureModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} /> Registrar Medidas de Cintura y Brazo
              </button>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {measurements.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Semana: {new Date(m.week_start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                      {m.waist_cm && <span>Cintura: {m.waist_cm} cm</span>}
                      {m.arm_cm && <span>Brazo: {m.arm_cm} cm</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPACT & FULLY SCROLLABLE UNIFIED MODAL */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => {
          setIsWeightModalOpen(false);
          setNewCheckinPhoto(null);
          setNewCheckinPhotoPreview(null);
        }}
        title="Registrar Peso Semanal & Progreso"
      >
        <form onSubmit={handleSaveIntegratedCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Row 1: Weight & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 81.4"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fecha Medición</label>
              <input
                type="date"
                value={newWeightDate}
                onChange={(e) => setNewWeightDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Row 2: Photo Picker */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Foto de Progreso (Opcional)</label>
            <div
              className="glass-card flex-center"
              style={{
                height: '95px',
                border: '2px dashed var(--border-glass)',
                flexDirection: 'column',
                cursor: 'pointer',
                overflow: 'hidden',
                padding: '8px',
              }}
              onClick={() => document.getElementById('checkin-photo-picker')?.click()}
            >
              {newCheckinPhotoPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={newCheckinPhotoPreview}
                    alt="Checkin photo"
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                    Foto seleccionada (clic para cambiar)
                  </span>
                </div>
              ) : (
                <>
                  <Upload size={20} color="var(--color-primary)" style={{ marginBottom: '2px' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                    Adjuntar foto de esta semana (Privada)
                  </span>
                </>
              )}
              <input
                type="file"
                id="checkin-photo-picker"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setNewCheckinPhoto(file);
                    setNewCheckinPhotoPreview(URL.createObjectURL(file));
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Row 3: Optional Measurements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cintura cm (Opcional)</label>
              <input
                type="number"
                step="0.5"
                placeholder="Ej. 84.0"
                value={newCheckinWaist}
                onChange={(e) => setNewCheckinWaist(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Brazo cm (Opcional)</label>
              <input
                type="number"
                step="0.5"
                placeholder="Ej. 34.5"
                value={newCheckinArm}
                onChange={(e) => setNewCheckinArm(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Row 4: Notes */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Notas u Observaciones (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. Buena adherencia al plan, energía alta"
              value={newWeightNotes}
              onChange={(e) => setNewWeightNotes(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsWeightModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {submitting ? 'Guardando...' : <><CheckCircle2 size={16} /> Guardar Registro</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* STANDALONE PHOTO UPLOAD MODAL */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setUploadFile(null);
          setUploadPreview(null);
        }}
        title="Subir Foto de Progreso"
      >
        <form onSubmit={handleUploadPhoto} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            className="glass-card flex-center"
            style={{
              height: '180px',
              border: '2px dashed var(--border-glass)',
              flexDirection: 'column',
              cursor: 'pointer',
              overflow: 'hidden',
              padding: '12px',
            }}
            onClick={() => document.getElementById('progress-photo-picker-standalone')?.click()}
          >
            {uploadPreview ? (
              <img
                src={uploadPreview}
                alt="Upload preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <>
                <Camera size={32} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                  Haz clic para elegir una foto
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  JPG, PNG o WEBP (Máx. 10MB)
                </span>
              </>
            )}
            <input
              type="file"
              id="progress-photo-picker-standalone"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setUploadFile(file);
                  setUploadPreview(URL.createObjectURL(file));
                }
              }}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!uploadFile || submitting}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {submitting ? 'Subiendo...' : 'Subir Foto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* STANDALONE MEASUREMENTS MODAL */}
      <Modal
        isOpen={isMeasureModalOpen}
        onClose={() => setIsMeasureModalOpen(false)}
        title="Registrar Medidas Corporales"
      >
        <form onSubmit={handleSaveMeasurement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Cintura (cm)</label>
            <input
              type="number"
              step="0.5"
              placeholder="Ej. 84.0"
              value={newWaist}
              onChange={(e) => setNewWaist(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Brazo (cm)</label>
            <input
              type="number"
              step="0.5"
              placeholder="Ej. 34.5"
              value={newArm}
              onChange={(e) => setNewArm(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsMeasureModalOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Guardar Medidas
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
