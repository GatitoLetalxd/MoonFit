import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSync } from '../../context/SyncContext';
import { theme } from '../../theme';
import { Cloud, CloudOff, RefreshCw, Zap } from 'lucide-react-native';

export const SyncBadge: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, processSyncQueue } = useSync();

  const handlePress = () => {
    if (isOnline && !isSyncing) {
      processSyncQueue();
    }
  };

  if (isSyncing) {
    return (
      <View style={[styles.badge, styles.badgeSyncing]}>
        <ActivityIndicator size={12} color={theme.colors.primary} style={{ marginRight: 5 }} />
        <Text style={[styles.text, styles.textSyncing]}>
          {pendingCount > 0 ? `Sincronizando (${pendingCount})...` : 'Sincronizando...'}
        </Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={[styles.badge, styles.badgeOffline]}>
        <Zap size={13} color="#f59e0b" style={{ marginRight: 4 }} />
        <Text style={[styles.text, styles.textOffline]}>
          {pendingCount > 0 ? `Offline (${pendingCount})` : 'Offline'}
        </Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <TouchableOpacity
        style={[styles.badge, styles.badgePending]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <RefreshCw size={12} color={theme.colors.primary} style={{ marginRight: 4 }} />
        <Text style={[styles.text, styles.textPending]}>
          {`Sincronizar (${pendingCount})`}
        </Text>
      </TouchableOpacity>
    );
  }

  // Online & fully synced
  return (
    <View style={[styles.badge, styles.badgeSynced]}>
      <Cloud size={13} color="#10b981" style={{ marginRight: 4 }} />
      <Text style={[styles.text, styles.textSynced]}>Sincronizado</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
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
