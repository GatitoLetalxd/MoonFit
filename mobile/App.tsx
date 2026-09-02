import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { SyncProvider } from './src/context/SyncContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
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
