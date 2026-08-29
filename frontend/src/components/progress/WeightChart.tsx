import React, { useState } from 'react';
import { WeeklyWeightLog } from '../../types';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightChartProps {
  logs: WeeklyWeightLog[];
  initialWeight?: number | null;
  targetWeight?: number | null;
}

export const WeightChart: React.FC<WeightChartProps> = ({
  logs,
  initialWeight,
  targetWeight,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    weight: number;
    date: string;
    notes?: string | null;
  } | null>(null);

  if (!logs || logs.length === 0) {
    return (
      <div
        className="glass-card flex-center"
        style={{
          height: '240px',
          flexDirection: 'column',
          color: 'var(--text-muted)',
          gap: '8px',
        }}
      >
        <TrendingDown size={32} color="var(--text-dim)" />
        <p>Aún no hay registros de peso semanal.</p>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Registra tu peso de cada lunes para ver tu evolución gráfica.
        </span>
      </div>
    );
  }

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.week_start_date).getTime() - new Date(b.week_start_date).getTime()
  );

  const weights = sortedLogs.map((l) => Number(l.weight_kg));
  if (initialWeight) weights.unshift(Number(initialWeight));

  const minWeight = Math.min(...weights, targetWeight || Infinity) - 1;
  const maxWeight = Math.max(...weights, targetWeight || -Infinity) + 1;
  const range = maxWeight - minWeight || 1;

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = sortedLogs.map((log, index) => {
    const x =
      padding.left +
      (sortedLogs.length === 1 ? chartW / 2 : (index / (sortedLogs.length - 1)) * chartW);
    const y =
      padding.top + chartH - ((Number(log.weight_kg) - minWeight) / range) * chartH;
    return {
      x,
      y,
      weight: Number(log.weight_kg),
      date: new Date(log.week_start_date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      notes: log.notes,
      raw: log,
    };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${
          padding.top + chartH
        } Z`
      : '';

  // Trend summary
  const firstW = points[0]?.weight || 0;
  const lastW = points[points.length - 1]?.weight || 0;
  const diff = Number((lastW - firstW).toFixed(1));

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      {/* Header with stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Evolución de Peso Semanal
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h3 style={{ fontSize: '1.8rem', color: '#fff', margin: 0 }}>
              {lastW} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg</span>
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: diff < 0 ? '#10b981' : diff > 0 ? '#f97316' : '#94a3b8',
              }}
            >
              {diff < 0 ? <TrendingDown size={16} /> : diff > 0 ? <TrendingUp size={16} /> : <Minus size={16} />}
              <span>{diff > 0 ? `+${diff}` : diff} kg total</span>
            </div>
          </div>
        </div>

        {targetWeight && (
          <div className="badge badge-cyan" style={{ padding: '6px 12px' }}>
            Meta: {targetWeight} kg
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '400px', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yVal = padding.top + chartH * ratio;
            const wVal = (maxWeight - ratio * range).toFixed(1);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yVal}
                  x2={padding.left + chartW}
                  y2={yVal}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={yVal + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {wVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#weightAreaGrad)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHoveredPoint({ index: i, ...p })}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.index === i ? '7' : '4.5'}
                fill="#0a0e17"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                style={{ transition: 'r 0.15s ease' }}
              />
              <text
                x={p.x}
                y={padding.top + chartH + 18}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-body)"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              position: 'absolute',
              top: '10px',
              left: `${(hoveredPoint.x / width) * 100}%`,
              transform: 'translateX(-50%)',
              padding: '8px 12px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
              {hoveredPoint.weight} kg
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Semana: {hoveredPoint.date}
            </div>
            {hoveredPoint.notes && (
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                "{hoveredPoint.notes}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
