import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { theme } from '../../theme';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react-native';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Campos requeridos', 'Ingresa tu correo y contraseña.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      showToast('¡Bienvenida a MoonFit!', 'Sesión iniciada correctamente.', 'success');
    } catch (err: any) {
      showToast('Error al iniciar sesión', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('rogeeromontufar@gmail.com');
    setPassword('password');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.brandName}>
            MOON<Text style={{ color: theme.colors.primary }}>FIT</Text>
          </Text>
          <Text style={styles.tagline}>Entrena en casa y transforma tus hábitos</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>INICIAR SESIÓN</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={theme.colors.textDim} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={theme.colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={theme.colors.textDim} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textDim}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <LogIn size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Entrar a MoonFit</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo */}
          <TouchableOpacity style={styles.demoBtn} onPress={handleQuickDemo}>
            <Text style={styles.demoBtnText}>⚡ Rellenar Credenciales Demo</Text>
          </TouchableOpacity>
        </View>

        {/* Switch to Register */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta aún?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Crear Cuenta Gratis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 23, 0.7)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  demoBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  demoBtnText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
});
