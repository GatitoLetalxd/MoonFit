import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { usersApi, progressApi } from '../../api/services';
import { scheduleLocalReminder } from '../../utils/notifications';
import { theme } from '../../theme';
import {
  User,
  Target,
  Camera,
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Flame,
} from 'lucide-react-native';

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const { showToast, triggerHaptic } = useNotification();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Step 1: Biometrics
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : '26');
  const [heightCm, setHeightCm] = useState<string>(user?.height_cm ? String(user.height_cm) : '170');
  const [initialWeight, setInitialWeight] = useState<string>(
    user?.initial_weight_kg ? String(user.initial_weight_kg) : '75.0'
  );

  // Step 2: Goal
  const [targetWeight, setTargetWeight] = useState<string>('68.0');
  const [targetDate, setTargetDate] = useState<string>('2026-12-31');

  // Step 3: Photo
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Step 4: Reminders
  const [reminderTime, setReminderTime] = useState<string>('07:30');
  const [reminderType, setReminderType] = useState<string>('entrenar');

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        triggerHaptic('success');
      }
    } catch (e) {
      showToast('Error', 'No se pudo abrir la galería', 'error');
    }
  };

  const handleNext = () => {
    triggerHaptic('light');
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);

      // 1. Guardar onboarding en backend
      await usersApi.completeOnboarding({
        age: Number(age) || 25,
        height_cm: Number(heightCm) || 170,
        initial_weight_kg: Number(initialWeight) || 70,
        target_weight_kg: Number(targetWeight) || 65,
        target_date: targetDate,
        reminder_time: reminderTime,
        reminder_type: reminderType,
      });

      // 2. Subir foto inicial si se seleccionó
      if (photoUri) {
        try {
          const formData = new FormData();
          const filename = photoUri.split('/').pop() || 'progress.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          formData.append('photo', {
            uri: photoUri,
            name: filename,
            type,
          } as any);

          await progressApi.uploadPhoto(formData);
        } catch (photoErr) {
          console.error('Error subiendo foto inicial:', photoErr);
        }
      }

      // 3. Programar notificación local en dispositivo
      await scheduleLocalReminder(reminderType, reminderTime);

      showToast('¡Plan Configurado!', 'Bienvenida a tu espacio de entrenamiento.', 'success');
      triggerHaptic('success');
      await refreshProfile();
    } catch (err: any) {
      showToast('Error al guardar', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 28) }]}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.headerTitle}>CONFIGURA TU PLAN</Text>
        <Text style={styles.headerSubtitle}>Paso {step} de 4 • Personalizando tu experiencia</Text>

        {/* Stepper Dots */}
        <View style={styles.stepperRow}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                s <= step && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STEP 1: Datos Biométricos */}
        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={24} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Tus Medidas Iniciales</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Edad (Años)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Altura (Centímetros)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={heightCm}
                onChangeText={setHeightCm}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso Actual (Kilogramos)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={initialWeight}
                onChangeText={setInitialWeight}
              />
            </View>
          </View>
        )}

        {/* STEP 2: Meta Principal */}
        {step === 2 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Target size={24} color={theme.colors.accent} />
              <Text style={styles.cardTitle}>Tu Objetivo de Peso</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso Meta Deseado (Kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={targetWeight}
                onChangeText={setTargetWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha Límite Estimada (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={targetDate}
                onChangeText={setTargetDate}
              />
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                💡 Te recomendamos una pérdida saludable y sostenible de 0.5 a 1 kg por semana.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 3: Primera Foto (Opcional) */}
        {step === 3 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Camera size={24} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Foto de Progreso Inicial</Text>
            </View>
            <Text style={styles.cardDesc}>
              Guarda tu punto de partida. Es 100% privada y solo tú puedes verla.
            </Text>

            {photoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickPhoto}>
                  <Text style={styles.changePhotoText}>Cambiar Fotografía</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBox} onPress={handlePickPhoto}>
                <Camera size={36} color={theme.colors.primary} />
                <Text style={styles.uploadTitle}>Seleccionar Foto de la Galería</Text>
                <Text style={styles.uploadSubtitle}>Opcional (puedes subirla después)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* STEP 4: Recordatorio Local */}
        {step === 4 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Bell size={24} color={theme.colors.success} />
              <Text style={styles.cardTitle}>Alarma de Entrenamiento</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hora del Recordatorio Diario</Text>
              <TextInput
                style={styles.input}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="07:30"
              />
            </View>

            <Text style={styles.label}>Tipo de Recordatorio</Text>
            <View style={styles.typeRow}>
              {[
                { id: 'entrenar', label: '🏋️‍♂️ Entrenar' },
                { id: 'agua', label: '💧 Tomar Agua' },
                { id: 'pesarse', label: '⚖️ Peso Semanal' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.typeBtn,
                    reminderType === t.id && styles.typeBtnActive,
                  ]}
                  onPress={() => setReminderType(t.id)}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      reminderType === t.id && styles.typeBtnTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        {step > 1 ? (
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={() => setStep(step - 1)}
          >
            <ArrowLeft size={18} color="#fff" />
            <Text style={styles.prevBtnText}>Atrás</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.nextBtnText}>
                {step === 4 ? '¡Comenzar!' : 'Siguiente'}
              </Text>
              <ArrowRight size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  header: {
    alignItems: 'center',
    paddingTop: 36,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    width: '100%',
    paddingHorizontal: 20,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: theme.radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
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
  input: {
    backgroundColor: 'rgba(11, 15, 23, 0.7)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    height: 48,
    color: '#fff',
    paddingHorizontal: 14,
    fontSize: 15,
  },
  tipBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  tipText: {
    fontSize: 12,
    color: theme.colors.primary,
    lineHeight: 18,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
  },
  uploadTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  uploadSubtitle: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  photoPreviewContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 220,
    borderRadius: theme.radius.md,
  },
  changePhotoBtn: {
    marginTop: 10,
    padding: 8,
  },
  changePhotoText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  typeBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: theme.colors.primary,
  },
  typeBtnText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(11, 15, 23, 0.95)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prevBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
