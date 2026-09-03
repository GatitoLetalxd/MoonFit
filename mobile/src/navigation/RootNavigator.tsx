import React from 'react';
import { View, ActivityIndicator, Image, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { WorkoutPlayerScreen } from '../screens/main/WorkoutPlayerScreen';
import { WorkoutHistoryScreen } from '../screens/main/WorkoutHistoryScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminUserDetailScreen } from '../screens/admin/AdminUserDetailScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.splashLogo}
          resizeMode="cover"
        />
        <Text style={styles.splashTitle}>
          MOON<Text style={{ color: theme.colors.primary }}>FIT</Text>
        </Text>
        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !user?.onboarding_completed ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="WorkoutPlayer"
            component={WorkoutPlayerScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
          <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0B0F17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
});
