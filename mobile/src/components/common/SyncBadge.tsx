import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSync } from '../../context/SyncContext';
import { theme } from '../../theme';
import { Cloud, Zap, RefreshCw } from 'lucide-react-native';

export const SyncBadge: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, processSyncQueue } = useSync();
  const [showText, setShowText] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const statusKey = isSyncing
    ? 'syncing'
    : !isOnline
    ? 'offline'
    : pendingCount > 0
    ? `pending_${pendingCount}`
    : 'synced';

  useEffect(() => {
    // Al cambiar de estado, mostrar el texto descriptivo
    setShowText(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Ocultar el texto después de 1 segundo para mantener únicamente el icono elegante
    timerRef.current = setTimeout(() => {
      setShowText(false);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [statusKey]);

  const handlePress = () => {
    // Si tocan el badge, mostrar el texto durante 2s y sincronizar si hay pendientes
    setShowText(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowText(false);
    }, 2000);

    if (isOnline && !isSyncing && pendingCount > 0) {
      processSyncQueue();
    }
  };

  if (isSyncing) {
    return (
      <TouchableOpacity
        style={[styles.badge, styles.badgeSyncing, !showText && styles.badgeIconOnly]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <ActivityIndicator
          size={12}
          color={theme.colors.primary}
          style={showText ? { marginRight: 5 } : undefined}
        />
        {showText && (
          <Text style={[styles.text, styles.textSyncing]}>
            {pendingCount > 0 ? `Sincronizando (${pendingCount})...` : 'Sincronizando...'}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  if (!isOnline) {
    return (
      <TouchableOpacity
        style={[styles.badge, styles.badgeOffline, !showText && styles.badgeIconOnly]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Zap
          size={13}
          color="#f59e0b"
          style={showText ? { marginRight: 4 } : undefined}
        />
        {showText && (
          <Text style={[styles.text, styles.textOffline]}>
            {pendingCount > 0 ? `Offline (${pendingCount})` : 'Offline'}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  if (pendingCount > 0) {
    return (
      <TouchableOpacity
        style={[styles.badge, styles.badgePending, !showText && styles.badgeIconOnly]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <RefreshCw
          size={12}
          color={theme.colors.primary}
          style={showText ? { marginRight: 4 } : undefined}
        />
        {showText && (
          <Text style={[styles.text, styles.textPending]}>
            {`Sincronizar (${pendingCount})`}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Online & fully synced
  return (
    <TouchableOpacity
      style={[styles.badge, styles.badgeSynced, !showText && styles.badgeIconOnly]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Cloud
        size={13}
        color="#10b981"
        style={showText ? { marginRight: 4 } : undefined}
      />
      {showText && <Text style={[styles.text, styles.textSynced]}>Sincronizado</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeIconOnly: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 10,
    justifyContent: 'center',
  },
  badgeSyncing: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgePending: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  badgeSynced: {
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textSyncing: {
    color: theme.colors.primary,
  },
  textOffline: {
    color: '#f59e0b',
  },
  textPending: {
    color: theme.colors.primary,
  },
  textSynced: {
    color: '#10b981',
  },
});
