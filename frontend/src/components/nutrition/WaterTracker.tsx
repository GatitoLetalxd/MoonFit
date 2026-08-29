import React, { useState } from 'react';
import { nutritionApi } from '../../api/services';
import { useNotification } from '../../context/NotificationContext';
import { Droplet, Plus } from 'lucide-react';

interface WaterTrackerProps {
  currentMl: number;
  targetMl?: number;
  onWaterUpdated: () => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  currentMl,
  targetMl = 2200,
  onWaterUpdated,
}) => {
  const { showToast, celebrate, playTone } = useNotification();
  const [loading, setLoading] = useState<boolean>(false);

  const percent = Math.min(100, Math.round((currentMl / targetMl) * 100));

  const addWater = async (amount: number) => {
    try {
      setLoading(true);
      playTone('start');
      await nutritionApi.logWater(amount);
      showToast(`+${amount} ml Registrados`, '¡Mantente hidratado durante todo el día!', 'success');

      if (currentMl + amount >= targetMl && currentMl < targetMl) {
        celebrate();
        showToast('🎯 ¡Meta de Hidratación Alcanzada!', 'Has cumplido la referencia saludable de agua para hoy.', 'success');
      }

      onWaterUpdated();
    } catch (err: any) {
      showToast('Error al registrar agua', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Droplet size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
              Hidratación Diaria
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Referencia orientativa: ~{targetMl} ml/día
            </span>
          </div>
        </div>

        <div className="badge badge-cyan" style={{ fontSize: '0.85rem' }}>
          {percent}%
        </div>
      </div>

      {/* Visual Water Level Bar */}
      <div style={{ margin: '16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '1.4rem' }}>
            {currentMl} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ml</span>
          </span>
          <span style={{ color: 'var(--text-dim)' }}>de {targetMl} ml</span>
        </div>

        <div
          style={{
            height: '14px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid rgba(6, 182, 212, 0.2)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
            }}
          />
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <button
          onClick={() => addWater(250)}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ flexDirection: 'column', gap: '2px', padding: '10px 6px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
            <Plus size={14} /> 250 ml
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>1 Vaso</span>
        </button>

        <button
          onClick={() => addWater(500)}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ flexDirection: 'column', gap: '2px', padding: '10px 6px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
            <Plus size={14} /> 500 ml
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>1 Botella</span>
        </button>

        <button
          onClick={() => addWater(1000)}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ flexDirection: 'column', gap: '2px', padding: '10px 6px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
            <Plus size={14} /> 1000 ml
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>1 Litro</span>
        </button>
      </div>
    </div>
  );
};
