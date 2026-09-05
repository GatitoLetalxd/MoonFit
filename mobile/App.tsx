import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import { SyncProvider } from './src/context/SyncContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import {
  initNotifications,
  handleNotificationActionResponse,
} from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    // 1. Inicializar canales, categorías y permisos de notificación
    initNotifications();

    // 2. Escuchador en primer y segundo plano para respuestas de notificaciones y acciones
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationActionResponse(response);
      }
    );

    // 3. Revisar si la app fue abierta desde frío mediante una acción de notificación
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationActionResponse(response);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <AuthProvider>
          <SyncProvider>
            <NotificationProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </NotificationProvider>
          </SyncProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
