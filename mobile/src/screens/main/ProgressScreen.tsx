import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useSync } from '../../context/SyncContext';
import { offlineStorage } from '../../utils/offlineStorage';
import { progressApi, goalsApi } from '../../api/services';
import { WeeklyWeightLog, ProgressPhoto, Goal } from '../../types';
import { theme } from '../../theme';
import {
  TrendingUp,
  Camera,
  Plus,
  Scale,
  Calendar,
  Layers,
  X,
  CheckCircle2,
  Sparkles,
  Download,
  Maximize2,
} from 'lucide-react-native';

export const ProgressScreen: React.FC<any> = ({ route }) => {
  const { user } = useAuth();
  const { showToast, triggerHaptic } = useNotification();
  const { isOnline, enqueueAction } = useSync();

  useEffect(() => {
    if (route?.params?.openWeightModal) {
      setWeightModalVisible(true);
      triggerHaptic('light');
    }
  }, [route?.params?.openWeightModal]);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeeklyWeightLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Visor de foto en grande
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [savingToGallery, setSavingToGallery] = useState<boolean>(false);

  // Modal registrar peso
  const [weightModalVisible, setWeightModalVisible] = useState<boolean>(false);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [submittingWeight, setSubmittingWeight] = useState<boolean>(false);

  // Modal comparador fotos
  const [compareModalVisible, setCompareModalVisible] = useState<boolean>(false);
  const [compareBeforePhoto, setCompareBeforePhoto] = useState<ProgressPhoto | null>(null);
  const [compareAfterPhoto, setCompareAfterPhoto] = useState<ProgressPhoto | null>(null);

  const loadLocalCache = async () => {
    try {
      const [token, cachedWeights, cachedGoal] = await Promise.all([
        AsyncStorage.getItem('@moonfit_access_token'),
        offlineStorage.getCachedWeightLogs(),
        offlineStorage.getCachedGoal(),
      ]);

      if (token) setAuthToken(token);
      if (cachedWeights && cachedWeights.length > 0) setWeightLogs(cachedWeights);
      if (cachedGoal) setActiveGoal(cachedGoal);
    } catch (e) {
      console.warn('Error reading progress cache:', e);
    }
  };

  const loadData = async () => {
    try {
      const [token, wRes, pRes, gRes] = await Promise.all([
        AsyncStorage.getItem('@moonfit_access_token'),
        progressApi.getWeightLogs().catch(() => ({ data: null })),
        progressApi.getPhotos().catch(() => ({ data: null })),
        goalsApi.getActiveGoal().catch(() => ({ data: null })),
      ]);

      if (token) setAuthToken(token);
      if (wRes.data && Array.isArray(wRes.data)) {
        setWeightLogs(wRes.data);
        await offlineStorage.saveCachedWeightLogs(wRes.data);
      }
      if (pRes.data && Array.isArray(pRes.data)) {
        setPhotos(pRes.data);
        if (pRes.data.length >= 2) {
          setCompareBeforePhoto(pRes.data[pRes.data.length - 1]);
          setCompareAfterPhoto(pRes.data[0]);
        }
      }
      if (gRes.data) {
        setActiveGoal(gRes.data);
        await offlineStorage.saveCachedGoal(gRes.data);
      }
    } catch (e) {
      console.log('Modo offline activo en Progreso: usando datos cacheados');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLocalCache().then(() => {
      loadData();
    });
  }, []);

  const handleSaveWeight = async () => {
    if (!newWeight.trim()) {
      showToast('Campo Requerido', 'Ingresa tu peso en kilogramos.', 'warning');
      return;
    }

    try {
      setSubmittingWeight(true);
      const weightNum = Number(newWeight);
      const nowIso = new Date().toISOString();
      const localLog: WeeklyWeightLog = {
        id: Date.now(),
        user_id: user?.id || '',
        week_start_date: nowIso.split('T')[0],
        weight_kg: weightNum,
        notes: newNotes.trim() || undefined,
        logged_at: nowIso,
        updated_at: nowIso,
      };

      // Guardar de inmediato en almacenamiento local para graficar al instante
      const updatedList = await offlineStorage.appendLocalWeight(localLog);
      setWeightLogs(updatedList);

      if (isOnline) {
        try {
          await progressApi.logWeight({
            weight_kg: weightNum,
            notes: newNotes.trim() || undefined,
          });
        } catch (e) {
          await enqueueAction('LOG_WEIGHT', {
            weight_kg: weightNum,
            notes: newNotes.trim() || undefined,
            loggedAt: nowIso,
          });
        }
      } else {
        await enqueueAction('LOG_WEIGHT', {
          weight_kg: weightNum,
          notes: newNotes.trim() || undefined,
          loggedAt: nowIso,
        });
      }

      showToast('¡Peso Registrado!', 'Se ha actualizado tu historial semanal.', 'success');
      triggerHaptic('success');
      setWeightModalVisible(false);
      setNewWeight('');
      setNewNotes('');
    } catch (e: any) {
      showToast('Error al registrar', e.response?.data?.message || e.message, 'error');
    } finally {
      setSubmittingWeight(false);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        uploadProgressPhoto(result.assets[0].uri);
      }
    } catch (e) {
      showToast('Error', 'No se pudo abrir la galería', 'error');
    }
  };

  const uploadProgressPhoto = async (uri: string) => {
    if (isOnline) {
      try {
        showToast('Subiendo foto...', 'Cifrando y guardando en servidor.', 'info');
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'progress.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('photo', {
          uri,
          name: filename,
          type,
        } as any);

        await progressApi.uploadPhoto(formData);
        showToast('¡Foto Guardada!', 'Se añadió a tu galería privada.', 'success');
        triggerHaptic('success');
        loadData();
      } catch (e: any) {
        await enqueueAction('UPLOAD_PROGRESS_PHOTO', { localUri: uri });
        showToast('Guardada en Cola', 'La foto se subirá automáticamente al reconectar internet.', 'info');
      }
    } else {
      await enqueueAction('UPLOAD_PROGRESS_PHOTO', { localUri: uri });
      showToast('Guardada en Cola', 'La foto se subirá automáticamente al reconectar internet.', 'info');
    }
  };

  const handleSavePhotoToGallery = async (photo: ProgressPhoto) => {
    try {
      triggerHaptic('light');
      setSavingToGallery(true);

      let perm = await MediaLibrary.getPermissionsAsync();
      if (!perm.granted && perm.status !== 'granted') {
        perm = await MediaLibrary.requestPermissionsAsync();
      }
      if (!perm.granted && perm.status !== 'granted') {
        showToast('Permiso Denegado', 'Se requiere permiso para guardar fotos en tu galería.', 'warning');
        setSavingToGallery(false);
        return;
      }

      showToast('Descargando...', 'Preparando imagen para tu galería.', 'info');
      const token = authToken || (await AsyncStorage.getItem('@moonfit_access_token'));
      const photoUrl = progressApi.getPhotoViewUrl(photo.id, token);
      const filename = `moonfit_progreso_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${filename}`;

      const res = await FileSystem.downloadAsync(photoUrl, fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.status === 200) {
        try {
          await MediaLibrary.createAssetAsync(res.uri);
        } catch {
          await MediaLibrary.saveToLibraryAsync(res.uri);
        }
        await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        triggerHaptic('success');
        showToast('¡Guardada en Galería!', 'La foto se guardó exitosamente en tu teléfono.', 'success');
      } else {
        showToast('Error', 'No se pudo descargar la imagen del servidor.', 'error');
      }
    } catch (e: any) {
      showToast('Error al guardar', e.message || 'No se pudo guardar la foto', 'error');
    } finally {
      setSavingToGallery(false);
    }
  };

  const latestWeight = weightLogs[0]?.weight_kg || user?.initial_weight_kg || 0;
  const initialWeight = user?.initial_weight_kg || latestWeight;
  const targetWeight = activeGoal?.target_weight_kg || 0;

  const totalLost = initialWeight > 0 && latestWeight > 0 ? (initialWeight - latestWeight).toFixed(1) : '0.0';

  return (
    <View style={styles.container}>
      <Header title="Progreso Físico" subtitle="Evolución semanal y fotos privadas" showSyncBadge={true} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.colors.primary} />}
      >
        {/* KPI Summary Row */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>PESO ACTUAL</Text>
            <Text style={styles.kpiValue}>{latestWeight} kg</Text>
            <Text style={styles.kpiSub}>Último registro</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>VARIACIÓN</Text>
            <Text style={[styles.kpiValue, { color: Number(totalLost) > 0 ? theme.colors.success : theme.colors.primary }]}>
              {Number(totalLost) > 0 ? `-${totalLost}` : totalLost} kg
            </Text>
            <Text style={styles.kpiSub}>Desde el inicio</Text>
          </View>
          {targetWeight > 0 && (
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>META</Text>
              <Text style={[styles.kpiValue, { color: theme.colors.accent }]}>{targetWeight} kg</Text>
              <Text style={styles.kpiSub}>Objetivo</Text>
            </View>
          )}
        </View>

        {/* Reassurance Banner */}
        <View style={styles.reassuranceBanner}>
          <Sparkles size={18} color={theme.colors.accent} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.reassuranceTitle}>El progreso real no es una línea recta</Text>
            <Text style={styles.reassuranceText}>
              El peso varía a diario por hidratación, digestión y recuperación muscular. Si tu fuerza aumenta o tu ropa te queda mejor, tu recomposición corporal va por excelente camino.
            </Text>
          </View>
        </View>

        {/* Action Button: Register Weight */}
        <TouchableOpacity
          style={styles.logWeightBtn}
          onPress={() => setWeightModalVisible(true)}
        >
          <Scale size={18} color="#fff" />
          <Text style={styles.logWeightBtnText}>Registrar Peso de Esta Semana</Text>
        </TouchableOpacity>

        {/* Weekly Weight History List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HISTORIAL DE PESO SEMANAL</Text>

          {weightLogs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No tienes registros de peso aún.</Text>
            </View>
          ) : (
            weightLogs.map((log, idx) => (
              <View key={log.id} style={styles.weightItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={styles.weightIconCircle}>
                    <TrendingUp size={16} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.weightDate}>
                      Semana {new Date(log.week_start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </Text>
                    {log.notes ? <Text style={styles.weightNotes}>"{log.notes}"</Text> : null}
                  </View>
                </View>
                <Text style={styles.weightItemKg}>{log.weight_kg} kg</Text>
              </View>
            ))
          )}
        </View>

        {/* Progress Photos Gallery */}
        <View style={styles.section}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>FOTOS DE PROGRESO PRIVADAS ({photos.length})</Text>
            {photos.length >= 2 && (
              <TouchableOpacity onPress={() => setCompareModalVisible(true)}>
                <Text style={styles.compareLink}>Comparar</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.addPhotoBox} onPress={handlePickPhoto}>
            <Camera size={24} color={theme.colors.primary} />
            <Text style={styles.addPhotoText}>Subir Nueva Foto de Progreso</Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.photosGrid}>
              {photos.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.photoThumbnailWrapper}
                  onPress={() => {
                    triggerHaptic('light');
                    setSelectedPhoto(p);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: progressApi.getPhotoViewUrl(p.id, authToken),
                      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                    }}
                    style={styles.photoThumbnail}
                  />
                  <View style={styles.zoomBadge}>
                    <Maximize2 size={12} color="#fff" />
                  </View>
                  <Text style={styles.photoDate}>
                    {new Date(p.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal: Registrar Peso */}
      <Modal visible={weightModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REGISTRAR PESO SEMANAL</Text>
              <TouchableOpacity onPress={() => setWeightModalVisible(false)}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso en Kilogramos (Kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 74.5"
                placeholderTextColor={theme.colors.textDim}
                keyboardType="decimal-pad"
                value={newWeight}
                onChangeText={setNewWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notas u Observaciones (Opcional)</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Ej. Me sentí ligera esta semana"
                placeholderTextColor={theme.colors.textDim}
                multiline
                value={newNotes}
                onChangeText={setNewNotes}
              />
            </View>

            <TouchableOpacity
              style={styles.submitModalBtn}
              onPress={handleSaveWeight}
              disabled={submittingWeight}
            >
              {submittingWeight ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitModalBtnText}>Guardar Registro</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Comparador Antes y Después */}
      <Modal visible={compareModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>COMPARADOR ANTES / DESPUÉS</Text>
              <TouchableOpacity onPress={() => setCompareModalVisible(false)}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {compareBeforePhoto && compareAfterPhoto && (
              <View style={styles.compareRow}>
                <View style={styles.compareCol}>
                  <Text style={styles.compareTag}>ANTES</Text>
                  <Image
                    source={{
                      uri: progressApi.getPhotoViewUrl(compareBeforePhoto.id, authToken),
                      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                    }}
                    style={styles.compareImage}
                  />
                  <Text style={styles.compareDate}>
                    {new Date(compareBeforePhoto.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>

                <View style={styles.compareCol}>
                  <Text style={[styles.compareTag, { color: theme.colors.success }]}>DESPUÉS</Text>
                  <Image
                    source={{
                      uri: progressApi.getPhotoViewUrl(compareAfterPhoto.id, authToken),
                      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                    }}
                    style={styles.compareImage}
                  />
                  <Text style={styles.compareDate}>
                    {new Date(compareAfterPhoto.taken_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: Ver Foto en Grande y Guardar en Galería */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalContent}>
            <View style={styles.photoModalHeader}>
              <View>
                <Text style={styles.photoModalTitle}>FOTO DE PROGRESO</Text>
                {selectedPhoto && (
                  <Text style={styles.photoModalDate}>
                    Tomada el {new Date(selectedPhoto.taken_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setSelectedPhoto(null)}
                style={styles.closeModalBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {selectedPhoto && (
              <View style={styles.largeImageContainer}>
                <Image
                  source={{
                    uri: progressApi.getPhotoViewUrl(selectedPhoto.id, authToken),
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                  }}
                  style={styles.largeImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {selectedPhoto && (
              <TouchableOpacity
                style={styles.saveGalleryBtn}
                onPress={() => handleSavePhotoToGallery(selectedPhoto)}
                disabled={savingToGallery}
              >
                {savingToGallery ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Download size={18} color="#fff" />
                    <Text style={styles.saveGalleryBtnText}>Guardar en Galería del Teléfono</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
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
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  reassuranceBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  reassuranceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  reassuranceText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(23, 31, 48, 0.8)',
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textDim,
    letterSpacing: 0.8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  logWeightBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logWeightBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyBox: {
    padding: 20,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
  weightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 8,
  },
  weightIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 50,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  weightNotes: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  weightItemKg: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compareLink: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  addPhotoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    padding: 16,
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    marginBottom: 14,
  },
  addPhotoText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoThumbnailWrapper: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  photoThumbnail: {
    width: '100%',
    height: 120,
  },
  photoDate: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
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
  submitModalBtn: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitModalBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  compareRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  compareCol: {
    flex: 1,
    alignItems: 'center',
  },
  compareTag: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 6,
  },
  compareImage: {
    width: '100%',
    height: 240,
    borderRadius: theme.radius.md,
  },
  compareDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 6,
  },
  zoomBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 12,
    padding: 4,
  },
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  photoModalContent: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#111827',
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  photoModalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  photoModalDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  largeImageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#000',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  saveGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
  },
  saveGalleryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
