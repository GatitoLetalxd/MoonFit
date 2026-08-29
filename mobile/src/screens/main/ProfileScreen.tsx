import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { remindersApi, goalsApi, usersApi } from '../../api/services';
import { scheduleLocalReminder, sendTestNotificationNow } from '../../utils/notifications';
import { Goal, Reminder } from '../../types';
import { theme } from '../../theme';
import {
  User,
  Target,
  Bell,
  LogOut,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  X,
  Check,
  HelpCircle,
  Plus,
  Volume2,
  Camera,
} from 'lucide-react-native';

const QUICK_TIME_PRESETS = [
  { label: '06:00 AM', time: '06:00', icon: '🌅' },
  { label: '06:30 AM', time: '06:30', icon: '⚡' },
  { label: '07:00 AM', time: '07:00', icon: '☀️' },
  { label: '07:30 AM', time: '07:30', icon: '🔥' },
  { label: '08:00 AM', time: '08:00', icon: '🏋️' },
  { label: '08:30 AM', time: '08:30', icon: '💪' },
  { label: '09:00 AM', time: '09:00', icon: '🧘' },
  { label: '06:00 PM', time: '18:00', icon: '🌆' },
  { label: '07:00 PM', time: '19:00', icon: '🌙' },
  { label: '08:00 PM', time: '20:00', icon: '🌟' },
  { label: '09:00 PM', time: '21:00', icon: '💤' },
];

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateUserLocal } = useAuth();
  const { showToast, triggerHaptic } = useNotification();

  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

  // Time picker modal state
  const [timeModalVisible, setTimeModalVisible] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [tempTime, setTempTime] = useState<string>('08:00');
  const [customHour, setCustomHour] = useState<string>('08');
  const [customMinute, setCustomMinute] = useState<string>('00');

  // Guide modal state
  const [guideModalVisible, setGuideModalVisible] = useState<boolean>(false);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadAvatar(result.assets[0].uri);
      }
    } catch (e) {
      showToast('Error', 'No se pudo abrir la galería de imágenes', 'error');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploadingAvatar(true);
      showToast('Subiendo foto...', 'Comprimiendo y guardando en tu perfil.', 'info');
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      const res = await usersApi.uploadAvatar(formData);
      if (res.data) {
        updateUserLocal(res.data);
        setAvatarTimestamp(Date.now());
        showToast('¡Foto Guardada!', 'Tu foto de perfil se actualizó con compresión optimizada.', 'success');
        triggerHaptic('success');
      }
    } catch (e: any) {
      showToast('Error al subir foto', e.message, 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const loadData = async () => {
    try {
      const [gRes, rRes] = await Promise.all([
        goalsApi.getActiveGoal().catch(() => ({ data: undefined })),
        remindersApi.getReminders().catch(() => ({ data: [] })),
      ]);

      if (gRes.data) setActiveGoal(gRes.data);
      if (rRes.data) {
        if (rRes.data.length === 0) {
          // Crear recordatorios por defecto si no existen
          const defaultRem = await remindersApi.createReminder({
            type: 'entrenar',
            time: '08:00',
            frequency: 'diario',
            active: true,
          }).catch(() => null);
          if (defaultRem?.data) {
            setReminders([defaultRem.data]);
            scheduleLocalReminder('entrenar', '08:00');
          }
        } else {
          setReminders(rRes.data);
        }
      }
    } catch (e) {
      console.error('Error cargando perfil:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleReminder = async (rem: Reminder) => {
    triggerHaptic('light');
    try {
      const newActive = !rem.active;
      await remindersApi.updateReminder(rem.id, { active: newActive });
      setReminders((prev) =>
        prev.map((r) => (r.id === rem.id ? { ...r, active: newActive } : r))
      );

      if (newActive) {
        await scheduleLocalReminder(rem.type, rem.time);
        showToast('Alarma Activada', `Recordatorio programado a las ${rem.time} con sonido y banner en pantalla.`, 'success');
      } else {
        showToast('Alarma Desactivada', `Recordatorio pausado.`, 'info');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    }
  };

  const handleOpenTimeModal = (rem: Reminder) => {
    triggerHaptic('light');
    setEditingReminder(rem);
    setTempTime(rem.time);
    const [h, m] = rem.time.split(':');
    setCustomHour(h || '08');
    setCustomMinute(m || '00');
    setTimeModalVisible(true);
  };

  const handleSaveTime = async () => {
    if (!editingReminder) return;

    // Formatear hora de 2 dígitos
    const h = String(Math.min(23, Math.max(0, parseInt(customHour, 10) || 0))).padStart(2, '0');
    const m = String(Math.min(59, Math.max(0, parseInt(customMinute, 10) || 0))).padStart(2, '0');
    const finalTime = `${h}:${m}`;

    try {
      await remindersApi.updateReminder(editingReminder.id, {
        time: finalTime,
        active: true,
      });

      setReminders((prev) =>
        prev.map((r) => (r.id === editingReminder.id ? { ...r, time: finalTime, active: true } : r))
      );

      await scheduleLocalReminder(editingReminder.type, finalTime);
      triggerHaptic('success');
      showToast(
        '¡Alarma Programada!',
        `Tu recordatorio sonará todos los días a las ${finalTime}.`,
        'success'
      );
      setTimeModalVisible(false);
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    }
  };

  const handleSelectPreset = (timeStr: string) => {
    triggerHaptic('light');
    setTempTime(timeStr);
    const [h, m] = timeStr.split(':');
    setCustomHour(h);
    setCustomMinute(m);
  };

  const handleAddDefaultReminder = async (type: string, timeStr: string) => {
    try {
      const res = await remindersApi.createReminder({
        type,
        time: timeStr,
        frequency: 'diario',
        active: true,
      });
      if (res.data) {
        const newRem = res.data;
        setReminders((prev) => [...prev, newRem]);
        await scheduleLocalReminder(type, timeStr);
        showToast('Recordatorio Creado', `Alarma activada a las ${timeStr}.`, 'success');
        triggerHaptic('success');
      }
    } catch (e: any) {
      showToast('Error', e.message, 'error');
    }
  };

  const handleTestNotification = async () => {
    triggerHaptic('success');
    showToast('Enviando Notificación...', 'Llegará como banner en pantalla con sonido en 2 segundos.', 'info');
    const sent = await sendTestNotificationNow();
    if (!sent) {
      showToast('Permisos Requeridos', 'Por favor habilita las notificaciones en los ajustes de tu teléfono.', 'warning');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás segura de que deseas salir de MoonFit?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          showToast('Sesión Cerrada', 'Hasta pronto.', 'info');
        },
      },
    ]);
  };

  // Cálculo de IMC
  const heightM = (user?.height_cm || 170) / 100;
  const currentWeight = user?.initial_weight_kg || 70;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);

  return (
    <View style={styles.container}>
      <Header title="Mi Perfil & Ajustes" subtitle="Configuración de cuenta y alarmas" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <TouchableOpacity
            style={styles.userAvatarContainer}
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
            activeOpacity={0.8}
          >
            {user?.avatar_url && user?.id ? (
              <Image
                source={{ uri: `${usersApi.getAvatarUrl(user.id)}?t=${avatarTimestamp}` }}
                style={styles.userAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                </Text>
              </View>
            )}
            <View style={styles.avatarCameraBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Camera size={13} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar}>
              <Text style={styles.changePhotoText}>
                {uploadingAvatar ? 'Comprimiendo...' : 'Cambiar foto de perfil 📷'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === 'ADMIN' ? '👑 ADMINISTRADOR' : 'MIEMBRO MOONFIT'}
              </Text>
            </View>
          </View>
        </View>

        {/* Biometrics Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>EDAD</Text>
            <Text style={styles.statValue}>{user?.age || '--'} años</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ALTURA</Text>
            <Text style={styles.statValue}>{user?.height_cm || '--'} cm</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>IMC ACTUAL</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{bmi}</Text>
          </View>
        </View>

        {/* Active Goal */}
        {activeGoal && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>Meta Principal</Text>
            </View>

            <View style={styles.goalRow}>
              <View>
                <Text style={styles.goalWeight}>{activeGoal.target_weight_kg} kg</Text>
                <Text style={styles.goalSub}>Peso objetivo</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.goalDate}>
                  {new Date(activeGoal.target_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.goalSub}>Fecha estimada</Text>
              </View>
            </View>
          </View>
        )}

        {/* Reminders & Alarms Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Bell size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Alarmas & Recordatorios</Text>
            </View>
            <TouchableOpacity onPress={() => setGuideModalVisible(true)} style={styles.helpBtn}>
              <HelpCircle size={18} color={theme.colors.primary} />
              <Text style={styles.helpBtnText}>Guía Pantalla</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionDescription}>
            Configura la hora exacta de tus recordatorios diarios con sonido y banner en pantalla.
          </Text>

          {reminders.map((rem) => (
            <View key={rem.id} style={styles.reminderCard}>
              <View style={styles.reminderCardLeft}>
                <Text style={styles.reminderType}>
                  {rem.type === 'entrenar'
                    ? '🔥 Hora de Entrenar'
                    : rem.type === 'agua'
                    ? '💧 Tomar Agua'
                    : '⚖️ Pesaje Semanal'}
                </Text>

                <TouchableOpacity
                  style={styles.timeBadgeBtn}
                  onPress={() => handleOpenTimeModal(rem)}
                >
                  <Clock size={14} color={theme.colors.primary} />
                  <Text style={styles.timeBadgeText}>{rem.time}</Text>
                  <Text style={styles.timeChangeTag}>Cambiar hora ✏️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.reminderCardRight}>
                <Text style={[styles.activeStatusTag, { color: rem.active ? theme.colors.success : theme.colors.textDim }]}>
                  {rem.active ? '● ACTIVA' : '○ PAUSADA'}
                </Text>
                <Switch
                  value={rem.active}
                  onValueChange={() => handleToggleReminder(rem)}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.primaryDark }}
                  thumbColor={rem.active ? theme.colors.primary : '#ccc'}
                />
              </View>
            </View>
          ))}

          {/* Quick Add Buttons if missing types */}
          {!reminders.some((r) => r.type === 'agua') && (
            <TouchableOpacity
              style={styles.addReminderBtn}
              onPress={() => handleAddDefaultReminder('agua', '10:00')}
            >
              <Plus size={16} color={theme.colors.primary} />
              <Text style={styles.addReminderBtnText}>+ Añadir Alarma para Tomar Agua (10:00 AM)</Text>
            </TouchableOpacity>
          )}

          {!reminders.some((r) => r.type === 'pesarse') && (
            <TouchableOpacity
              style={styles.addReminderBtn}
              onPress={() => handleAddDefaultReminder('pesarse', '09:00')}
            >
              <Plus size={16} color={theme.colors.accent} />
              <Text style={[styles.addReminderBtnText, { color: theme.colors.accent }]}>
                + Añadir Alarma para Pesaje Semanal (09:00 AM)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.testNotificationBtn} onPress={handleTestNotification}>
            <Volume2 size={16} color={theme.colors.primary} />
            <Text style={styles.testNotificationText}>Probar Notificación Flotante con Sonido</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={theme.colors.danger} />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal: Selector de Hora Elegante */}
      <Modal visible={timeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Clock size={20} color={theme.colors.primary} />
                <Text style={styles.modalTitle}>
                  ELEGIR HORA: {editingReminder?.type.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setTimeModalVisible(false)}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Selecciona un horario recomendado o ingresa tu hora personalizada:
            </Text>

            {/* Presets Chips Grid */}
            <Text style={styles.pickerSectionLabel}>HORARIOS RÁPIDOS:</Text>
            <View style={styles.presetsGrid}>
              {QUICK_TIME_PRESETS.map((p) => {
                const isSelected = `${customHour}:${customMinute}` === p.time;
                return (
                  <TouchableOpacity
                    key={p.time}
                    style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                    onPress={() => handleSelectPreset(p.time)}
                  >
                    <Text style={styles.presetChipIcon}>{p.icon}</Text>
                    <Text style={[styles.presetChipText, isSelected && styles.presetChipTextSelected]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input */}
            <Text style={styles.pickerSectionLabel}>O INGRESA LA HORA EXACTA (Formato 24h):</Text>
            <View style={styles.timeInputRow}>
              <View style={styles.timeInputBox}>
                <Text style={styles.timeInputLabel}>HORA (00-23)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={customHour}
                  onChangeText={(val) => setCustomHour(val.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="08"
                  placeholderTextColor={theme.colors.textDim}
                />
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeInputBox}>
                <Text style={styles.timeInputLabel}>MINUTOS (00-59)</Text>
                <TextInput
                  style={styles.timeInput}
                  value={customMinute}
                  onChangeText={(val) => setCustomMinute(val.replace(/[^0-9]/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor={theme.colors.textDim}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveTimeBtn} onPress={handleSaveTime}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveTimeBtnText}>
                Guardar y Activar Alarma ({String(customHour).padStart(2, '0')}:{String(customMinute).padStart(2, '0')})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Guía para Notificaciones en Pantalla */}
      <Modal visible={guideModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <HelpCircle size={20} color={theme.colors.primary} />
                <Text style={styles.modalTitle}>NOTIFICACIONES EN PANTALLA</Text>
              </View>
              <TouchableOpacity onPress={() => setGuideModalVisible(false)}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.guideText}>
                Para que las notificaciones de MoonFit aparezcan como <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>banner flotante en tu pantalla</Text> y suenen siempre puntuales:
              </Text>

              <View style={styles.guideStep}>
                <Text style={styles.guideStepNum}>1</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideStepTitle}>Notificaciones Flotantes / Banner</Text>
                  <Text style={styles.guideStepDesc}>
                    Ve a Ajustes de Android &gt; Aplicaciones &gt; MoonFit &gt; Notificaciones &gt; y activa <Text style={{ color: '#fff' }}>"Permitir notificaciones flotantes"</Text> y <Text style={{ color: '#fff' }}>"En pantalla de bloqueo"</Text>.
                  </Text>
                </View>
              </View>

              <View style={styles.guideStep}>
                <Text style={styles.guideStepNum}>2</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideStepTitle}>Sonido & Vibración</Text>
                  <Text style={styles.guideStepDesc}>
                    Entra a la categoría <Text style={{ color: '#fff' }}>"Recordatorios MoonFit"</Text> y verifica que la importancia sea <Text style={{ color: '#fff' }}>Urgente / Alta</Text> con sonido activado.
                  </Text>
                </View>
              </View>

              <View style={styles.guideStep}>
                <Text style={styles.guideStepNum}>3</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideStepTitle}>Inicio Automático (Xiaomi / MIUI / HyperOS)</Text>
                  <Text style={styles.guideStepDesc}>
                    En la información de la app MoonFit, habilita la opción <Text style={{ color: '#fff' }}>"Inicio automático"</Text> y en Ahorro de Batería selecciona <Text style={{ color: '#fff' }}>"Sin restricciones"</Text>.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.guideCloseBtn}
                onPress={() => setGuideModalVisible(false)}
              >
                <Text style={styles.guideCloseBtnText}>¡Entendido!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 16,
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0891B2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  userAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111827',
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  changePhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 2,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    marginTop: 6,
  },
  roleBadgeText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textDim,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 14,
  },
  goalWeight: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.accent,
  },
  goalDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  goalSub: {
    fontSize: 11,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 14,
    lineHeight: 16,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  helpBtnText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reminderCardLeft: {
    flex: 1,
  },
  reminderCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  reminderType: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  timeBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
    gap: 6,
  },
  timeBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  timeChangeTag: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  activeStatusTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.radius.md,
    marginTop: 6,
    marginBottom: 10,
  },
  addReminderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  testNotificationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginTop: 8,
  },
  testNotificationText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  pickerSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textDim,
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(23, 31, 48, 0.9)',
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetChipSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    borderColor: theme.colors.primary,
  },
  presetChipIcon: {
    fontSize: 13,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  presetChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  timeInputBox: {
    alignItems: 'center',
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textDim,
    marginBottom: 6,
  },
  timeInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  timeSeparator: {
    fontSize: 30,
    fontWeight: '900',
    color: theme.colors.primary,
    marginTop: 18,
  },
  saveTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 10,
  },
  saveTimeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  guideText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  guideStep: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  guideStepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 26,
  },
  guideStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  guideStepDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 17,
  },
  guideCloseBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  guideCloseBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
