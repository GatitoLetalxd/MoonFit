import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { getExerciseMedia } from '../../utils/exerciseMedia';

interface ExerciseDemoProps {
  exerciseName: string;
  /** 'lg' for WorkoutPlayer main view, 'md' for rest preview, 'sm' for catalog thumbnail */
  size?: 'lg' | 'md' | 'sm';
}

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  lg: {
    width: '100%',
    maxWidth: '340px',
    aspectRatio: '1 / 1',
    borderRadius: '16px',
  },
  md: {
    width: '140px',
    height: '140px',
    borderRadius: '12px',
  },
  sm: {
    width: '100%',
    aspectRatio: '16 / 10',
    borderRadius: '10px',
    maxHeight: '180px',
  },
};

export const ExerciseDemo: React.FC<ExerciseDemoProps> = ({
  exerciseName,
  size = 'lg',
}) => {
  const mediaSrc = getExerciseMedia(exerciseName);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const containerStyle: React.CSSProperties = {
    ...SIZE_STYLES[size],
    overflow: 'hidden',
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
  };

  // No media mapped → show fallback
  if (!mediaSrc || error) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Dumbbell
          size={size === 'lg' ? 48 : size === 'md' ? 32 : 24}
          color="var(--color-primary)"
          style={{ opacity: 0.5 }}
        />
        {size === 'lg' && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              textAlign: 'center',
              padding: '0 12px',
              maxWidth: '200px',
            }}
          >
            {exerciseName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Skeleton placeholder while loading */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(110deg, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Dumbbell
            size={size === 'lg' ? 40 : 24}
            color="var(--color-primary)"
            style={{ opacity: 0.3 }}
          />
        </div>
      )}

      <img
        src={mediaSrc}
        alt={`Demostración: ${exerciseName}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
    </div>
  );
};
