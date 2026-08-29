import React, { createContext, useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react-native';
import { theme } from '../theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  title: string;
  message?: string;
  type: ToastType;
}

interface NotificationContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  triggerHaptic: (type?: 'success' | 'warning' | 'error' | 'light' | 'medium') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastData | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const timerRef = useRef<any>(null);

  const triggerHaptic = (type: 'success' | 'warning' | 'error' | 'light' | 'medium' = 'light') => {
    try {
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      // Haptics optional on emulators
    }
  };

  const showToast = (title: string, message?: string, type: ToastType = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ title, message, type });
    triggerHaptic(type === 'error' ? 'error' : type === 'success' ? 'success' : 'light');

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast(null);
      });
    }, 3200);
  };

  const getToastBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.danger;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, triggerHaptic }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity,
              transform: [{ translateY }],
              borderColor: getToastBorderColor(toast.type),
            },
          ]}
        >
          <View style={styles.iconContainer}>
            {toast.type === 'success' && <CheckCircle2 size={22} color={theme.colors.success} />}
            {toast.type === 'error' && <XCircle size={22} color={theme.colors.danger} />}
            {toast.type === 'warning' && <AlertCircle size={22} color={theme.colors.warning} />}
            {toast.type === 'info' && <Info size={22} color={theme.colors.primary} />}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.toastTitle}>{toast.title}</Text>
            {toast.message ? <Text style={styles.toastMessage}>{toast.message}</Text> : null}
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 9999,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  toastMessage: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
