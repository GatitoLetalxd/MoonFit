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
import { User as UserIcon, Mail, Lock, UserPlus } from 'lucide-react-native';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Campos requeridos', 'Por favor llena todos los campos.', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Contraseña débil', 'Debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      showToast('¡Cuenta Creada!', 'Bienvenida a tu transformación con MoonFit.', 'success');
    } catch (err: any) {
      showToast('Error al registrarse', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.brandHeader}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.brandName}>
            MOON<Text style={{ color: theme.colors.primary }}>FIT</Text>
          </Text>
          <Text style={styles.tagline}>Crea tu cuenta y empieza hoy mismo</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>CREAR CUENTA</Text>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inputWrapper}>
              <UserIcon size={18} color={theme.colors.textDim} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={theme.colors.textDim}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
                placeholder="Mínimo 6 caracteres"
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <UserPlus size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Registrarme</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Switch to Login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Iniciar Sesión</Text>
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
    marginBottom: 28,
    marginTop: 10,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  brandName: {
    fontSize: 28,
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
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 14,
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
  loginLink: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
});
