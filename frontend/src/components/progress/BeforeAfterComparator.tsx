import React, { useState, useEffect, useRef } from 'react';
import { ProgressPhoto } from '../../types';
import { progressApi } from '../../api/services';
import { useAuthenticatedImage } from '../../utils/useAuthImage';
import {
  ArrowLeftRight,
  Columns,
  Layers,
  Camera,
  Plus,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface BeforeAfterProps {
  photos: ProgressPhoto[];
  onUploadClick?: () => void;
}

export const BeforeAfterComparator: React.FC<BeforeAfterProps> = ({ photos, onUploadClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  // Photo selection
  const [beforePhotoId, setBeforePhotoId] = useState<string>(
    photos && photos.length > 0 ? photos[photos.length - 1].id : ''
  );
  const [afterPhotoId, setAfterPhotoId] = useState<string>(
    photos && photos.length > 0 ? photos[0].id : ''
  );

  // Sync state when photos change
  useEffect(() => {
    if (photos && photos.length > 0) {
      if (!photos.some((p) => p.id === beforePhotoId)) {
        setBeforePhotoId(photos[photos.length - 1].id);
      }
      if (!photos.some((p) => p.id === afterPhotoId)) {
        setAfterPhotoId(photos[0].id);
      }
    }
  }, [photos]);

  const beforeImg = useAuthenticatedImage(beforePhotoId ? progressApi.getPhotoViewUrl(beforePhotoId) : '');
  const afterImg = useAuthenticatedImage(afterPhotoId ? progressApi.getPhotoViewUrl(afterPhotoId) : '');

  // Calculate position from clientX
  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offset = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percentage = Math.max(0, Math.min(100, (offset / rect.width) * 100));
    setSliderPos(percentage);
  };

  // Global window pointer listener for ultra-smooth drag
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  // Fallback / Guidance if fewer than 2 photos
  if (!photos || photos.length < 2) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          border: '1px dashed var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(139, 92, 246, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
          }}
        >
          <Camera size={28} />
        </div>

        <div>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, marginBottom: '6px' }}>
            Comparador de Transformación Antes / Después
          </h3>
          <p style={{ maxWidth: '460px', fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
            {photos.length === 0
              ? 'Sube tus fotos de progreso semanales para desbloquear el comparador interactivo con divisor deslizante.'
              : 'Tienes 1 foto registrada. Sube tu segunda foto de progreso para comparar tu evolución física.'}
          </p>
        </div>

        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="btn btn-primary"
            style={{ marginTop: '4px', boxShadow: '0 0 20px var(--color-primary-glow)' }}
          >
            <Plus size={18} /> Subir Foto de Progreso Ahora
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '22px' }}>
      {/* Header Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>
              Comparativa Antes / Después
            </h4>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              Interactivo
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Arrastra el deslizador central o usa la barra para ver la transformación
          </span>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`btn btn-sm ${viewMode === 'slider' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={15} /> Deslizador
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`btn btn-sm ${viewMode === 'side-by-side' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Columns size={15} /> Lado a Lado
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: 'var(--color-primary)' }}>
            Foto Inicial (Antes):
          </label>
          <select
            value={beforePhotoId}
            onChange={(e) => setBeforePhotoId(e.target.value)}
            className="select-field"
          >
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {new Date(p.taken_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: '#10b981' }}>
            Foto Posterior (Después):
          </label>
          <select
            value={afterPhotoId}
            onChange={(e) => setAfterPhotoId(e.target.value)}
            className="select-field"
          >
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {new Date(p.taken_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SLIDER VIEW MODE */}
      {viewMode === 'slider' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Main Visual Stage */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            style={{
              position: 'relative',
              width: '100%',
              height: '440px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none',
              cursor: isDragging ? 'grabbing' : 'ew-resize',
              background: '#070b13',
              border: '1px solid var(--border-glass)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
            }}
          >
            {/* LAYER 1: AFTER IMAGE (Full background) */}
            {afterImg.src ? (
              <img
                src={afterImg.src}
                alt="Después"
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
            ) : (
              <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-dim)' }}>
                {afterImg.loading ? 'Cargando foto actual...' : 'Foto no disponible'}
              </div>
            )}

            <div
              className="badge badge-success"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                zIndex: 5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              DESPUÉS
            </div>

            {/* LAYER 2: BEFORE IMAGE (Clipped with polygon) */}
            {beforeImg.src && (
              <img
                src={beforeImg.src}
                alt="Antes"
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                  WebkitClipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                }}
              />
            )}

            <div
              className="badge badge-primary"
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                zIndex: 5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              ANTES
            </div>

            {/* VERTICAL DIVIDER LINE */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${sliderPos}%`,
                width: '3px',
                background: '#ffffff',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.9), 0 0 6px var(--color-primary-glow)',
                transform: 'translateX(-50%)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            />

            {/* INTERACTIVE DRAG HANDLE */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${sliderPos}%`,
                transform: 'translate(-50%, -50%)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#ffffff',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 15px var(--color-primary-glow)',
                zIndex: 12,
                cursor: isDragging ? 'grabbing' : 'ew-resize',
                transition: isDragging ? 'none' : 'transform 0.1s ease',
              }}
            >
              <ArrowLeftRight size={20} strokeWidth={2.5} />
            </div>
          </div>

          {/* RANGE SLIDER INPUT FOR ACCESSIBILITY & PRECISION */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              Antes (0%)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(sliderPos)}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              style={{
                flex: 1,
                cursor: 'pointer',
                accentColor: 'var(--color-primary)',
                height: '6px',
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
              Después (100%)
            </span>
          </div>
        </div>
      ) : (
        /* SIDE BY SIDE VIEW MODE */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            height: '380px',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#070b13',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="badge badge-primary" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
              ANTES
            </div>
            {beforeImg.src ? (
              <img
                src={beforeImg.src}
                alt="Antes"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-dim)' }}>
                Cargando...
              </div>
            )}
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#070b13',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="badge badge-success" style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
              DESPUÉS
            </div>
            {afterImg.src ? (
              <img
                src={afterImg.src}
                alt="Después"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-dim)' }}>
                Cargando...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
