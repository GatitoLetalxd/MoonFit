import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '540px',
}) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999, // Highest priority above everything
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth,
          marginTop: 'min(30px, 3vh)',
          marginBottom: '30px',
          maxHeight: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(17, 24, 39, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.9), 0 0 30px rgba(249, 115, 22, 0.15)',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0,
          }}
        >
          <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 700 }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.15s ease',
            }}
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with guaranteed internal scrolling */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            flex: '1 1 auto',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
