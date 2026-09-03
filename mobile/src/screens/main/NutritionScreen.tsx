import React, { useState, useEffect, useCallback } from 'react';
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
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { useNotification } from '../../context/NotificationContext';
import { useSync } from '../../context/SyncContext';
import { offlineStorage } from '../../utils/offlineStorage';
import { nutritionApi } from '../../api/services';
import { Meal } from '../../types';
import { theme } from '../../theme';
import {
  Utensils,
  Droplets,
  Plus,
  Camera,
  X,
  Sparkles,
  Heart,
  Zap,
  Coffee,
  Maximize2,
  Download,
} from 'lucide-react-native';

const MEAL_TYPES = [
  { id: 'desayuno', label: 'Desayuno', icon: '🍳' },
  { id: 'almuerzo', label: 'Almuerzo', icon: '🥗' },
  { id: 'cena', label: 'Cena', icon: '🍲' },
  { id: 'snack', label: 'Snack', icon: '🍎' },
];

const FEELINGS = [
  { id: 'ligera', label: 'Ligera y con energía', emoji: '✨' },
  { id: 'satisfecha', label: 'Satisfecha y bien', emoji: '😊' },
  { id: 'pesada', label: 'Pesada o con pereza', emoji: '😴' },
  { id: 'antojo', label: 'Fue un gusto consciente', emoji: '🍫' },
];

export const NutritionScreen: React.FC = () => {
  const { showToast, triggerHaptic } = useNotification();
  const { isOnline, enqueueAction } = useSync();

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [todayWaterMl, setTodayWaterMl] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Visor de foto de comida en grande
  const [selectedMealPhoto, setSelectedMealPhoto] = useState<{ url: string; meal: Meal } | null>(null);
  const [savingMealPhoto, setSavingMealPhoto] = useState<boolean>(false);

  // Modal registrar comida
  const [mealModalVisible, setMealModalVisible] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('almuerzo');
  const [selectedFeeling, setSelectedFeeling] = useState<string>('satisfecha');
  const [notes, setNotes] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submittingMeal, setSubmittingMeal] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem('@moonfit_access_token').then(setAuthToken);
  }, []);

  const loadLocalCache = async () => {
    try {
      const cachedWater = await offlineStorage.getCachedWater();
      if (cachedWater && typeof cachedWater.total_ml === 'number') {
        setTodayWaterMl(cachedWater.total_ml);
      }
    } catch (e) {
      console.warn('Error reading water cache:', e);
    }
  };

  const loadData = async () => {
    try {
      const [mRes, wRes] = await Promise.all([
        nutritionApi.getMeals().catch(() => ({ data: null })),
        nutritionApi.getTodayWater().catch(() => ({ data: null })),
      ]);

      if (mRes.data && Array.isArray(mRes.data)) {
        setMeals(mRes.data);
      }
      if (wRes.data && typeof wRes.data.total_ml === 'number') {
        setTodayWaterMl(wRes.data.total_ml);
        await offlineStorage.saveCachedWater(wRes.data);
      }
    } catch (e) {
      console.log('Modo offline activo en Nutrición: usando datos locales');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLocalCache().then(() => {
      loadData();
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Sincronizar agua inmediatamente al volver a la pestaña de Nutrición
      offlineStorage.getCachedWater().then((w) => {
        if (w && typeof w.total_ml === 'number') {
          setTodayWaterMl(w.total_ml);
        }
      });
      loadData();
    }, [])
  );

  const handleAddWater = async (ml: number) => {
    triggerHaptic('success');
    // Actualización sincronizada en UI y almacenamiento local
    const newTotal = await offlineStorage.addLocalWater(ml);
    setTodayWaterMl(newTotal);

    if (isOnline) {
      try {
        await nutritionApi.logWater(ml);
      } catch (e: any) {
        await enqueueAction('LOG_WATER', { amount_ml: ml, loggedAt: new Date().toISOString() });
      }
    } else {
      await enqueueAction('LOG_WATER', { amount_ml: ml, loggedAt: new Date().toISOString() });
    }

    showToast('¡Hidratación Sumada!', `+${ml} ml registrados con éxito.`, 'success');
  };

  const handleSaveMealPhotoToGallery = async (photoUrl: string) => {
    try {
      triggerHaptic('light');
      setSavingMealPhoto(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permiso Denegado', 'Se requiere permiso para guardar fotos en tu galería.', 'warning');
        setSavingMealPhoto(false);
        return;
      }

      showToast('Descargando...', 'Guardando foto de comida en tu galería.', 'info');
      const filename = `moonfit_comida_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const res = await FileSystem.downloadAsync(photoUrl, fileUri, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });

      if (res.status === 200) {
        await MediaLibrary.saveToLibraryAsync(res.uri);
        triggerHaptic('success');
        showToast('¡Guardada en Galería!', 'La foto se guardó exitosamente en tu teléfono.', 'success');
      } else {
        showToast('Error', 'No se pudo descargar la imagen.', 'error');
      }
    } catch (e: any) {
      showToast('Error al guardar', e.message || 'No se pudo guardar la foto', 'error');
    } finally {
      setSavingMealPhoto(false);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
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

  const handleSaveMeal = async () => {
    try {
      setSubmittingMeal(true);
      const formData = new FormData();
      formData.append('meal_type', selectedType);

      const combinedNotes = notes.trim()
        ? `[Sensación: ${selectedFeeling}] ${notes.trim()}`
        : `Sensación: ${selectedFeeling}`;

      formData.append('description', combinedNotes);

      if (photoUri) {
        const filename = photoUri.split('/').pop() || 'meal.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type,
        } as any);
      }

      await nutritionApi.logMeal(formData);
      showToast('¡Comida Registrada!', 'Se guardó en tu diario de hábitos.', 'success');
      triggerHaptic('success');

      setMealModalVisible(false);
      setNotes('');
      setPhotoUri(null);
      loadData();
    } catch (e: any) {
      showToast('Error al registrar', e.message, 'error');
    } finally {
      setSubmittingMeal(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Nutrición & Hábitos" subtitle="Registro simple en 3 clics y agua" showSyncBadge={true} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.colors.primary} />}
      >
        {/* Water Tracker Card */}
        <View style={styles.waterCard}>
          <View style={styles.waterCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Droplets size={24} color={theme.colors.primary} />
              <View>
                <Text style={styles.waterCardTitle}>Hidratación Diaria</Text>
                <Text style={styles.waterCardSubtitle}>Meta recomendada: 2,200 ml</Text>
              </View>
            </View>
            <Text style={styles.waterTotal}>{todayWaterMl} ml</Text>
          </View>

          {/* Fill Bar */}
          <View style={styles.waterBarTrack}>
            <View
              style={[
                styles.waterBarFill,
                { width: `${Math.min(100, (todayWaterMl / 2200) * 100)}%` },
              ]}
            />
          </View>

          {/* Quick Buttons */}
          <View style={styles.waterButtonsRow}>
            <TouchableOpacity style={styles.waterBtn} onPress={() => handleAddWater(250)}>
              <Text style={styles.waterBtnText}>+250 ml (1 Vaso)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waterBtn} onPress={() => handleAddWater(500)}>
              <Text style={styles.waterBtnText}>+500 ml (1 Botella)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button: Register Meal */}
        <TouchableOpacity
          style={styles.logMealBtn}
          onPress={() => setMealModalVisible(true)}
        >
          <Utensils size={18} color="#fff" />
          <Text style={styles.logMealBtnText}>Registrar Comida en 3 Clics</Text>
        </TouchableOpacity>

        {/* Meals History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HISTORIAL DE COMIDAS ({meals.length})</Text>

          {meals.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No has registrado comidas aún.</Text>
            </View>
          ) : (
            meals.map((meal) => {
              const hasPhoto = meal.photos && meal.photos.length > 0;
              const photoUrl = hasPhoto
                ? nutritionApi.getMealPhotoViewUrl(meal.photos![0].id, authToken)
                : null;
              return (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealCardHeader}>
                    <View style={styles.mealTypeBadge}>
                      <Text style={styles.mealTypeBadgeText}>
                        {(meal.meal_type || 'Comida').toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.mealDate}>
                      {new Date(meal.logged_at).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })} • {new Date(meal.logged_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={styles.mealBodyRow}>
                    {hasPhoto && photoUrl ? (
                      <TouchableOpacity
                        style={styles.mealThumbContainer}
                        onPress={() => {
                          triggerHaptic('light');
                          setSelectedMealPhoto({ url: photoUrl, meal });
                        }}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{
                            uri: photoUrl,
                            headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                          }}
                          style={styles.mealThumbImage}
                        />
                        <View style={styles.mealZoomBadge}>
                          <Maximize2 size={11} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    ) : null}

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={styles.mealDescription}>
                        {meal.description || 'Comida registrada'}
                      </Text>
                      {hasPhoto && (
                        <TouchableOpacity
                          style={styles.viewPhotoLink}
                          onPress={() => {
                            triggerHaptic('light');
                            setSelectedMealPhoto({ url: photoUrl!, meal });
                          }}
                        >
                          <Text style={styles.viewPhotoLinkText}>Ver foto completa 🔍</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal: Registrar Comida */}
      <Modal visible={mealModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>REGISTRO RÁPIDO DE COMIDA</Text>
              <TouchableOpacity onPress={() => setMealModalVisible(false)}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Step 1: Tipo de Comida */}
              <Text style={styles.stepLabel}>1. TIPO DE COMIDA</Text>
              <View style={styles.typesGrid}>
                {MEAL_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.typeOption, selectedType === t.id && styles.typeOptionActive]}
                    onPress={() => setSelectedType(t.id)}
                  >
                    <Text style={{ fontSize: 20 }}>{t.icon}</Text>
                    <Text style={[styles.typeOptionText, selectedType === t.id && styles.typeOptionTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 2: Sensación Corporal */}
              <Text style={[styles.stepLabel, { marginTop: 14 }]}>2. ¿CÓMO TE HIZO SENTIR?</Text>
              <View style={styles.feelingsGrid}>
                {FEELINGS.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.feelingOption, selectedFeeling === f.label && styles.feelingOptionActive]}
                    onPress={() => setSelectedFeeling(f.label)}
                  >
                    <Text style={{ fontSize: 16 }}>{f.emoji}</Text>
                    <Text style={[styles.feelingOptionText, selectedFeeling === f.label && styles.feelingOptionTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Step 3: Foto Opcional */}
              <Text style={[styles.stepLabel, { marginTop: 14 }]}>3. FOTO DEL PLATO (OPCIONAL)</Text>
              {photoUri ? (
                <View style={{ alignItems: 'center' }}>
                  <Image source={{ uri: photoUri }} style={styles.mealPhotoPreview} />
                  <TouchableOpacity onPress={handlePickPhoto} style={{ marginTop: 6 }}>
                    <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>Cambiar Foto</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.photoUploadBox} onPress={handlePickPhoto}>
                  <Camera size={20} color={theme.colors.primary} />
                  <Text style={styles.photoUploadText}>Tomar o Subir Foto</Text>
                </TouchableOpacity>
              )}

              {/* Notas */}
              <Text style={[styles.stepLabel, { marginTop: 14 }]}>NOTAS (OPCIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Ej. Pollo a la plancha con ensalada fresca"
                placeholderTextColor={theme.colors.textDim}
                value={notes}
                onChangeText={setNotes}
              />

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitMealBtn}
                onPress={handleSaveMeal}
                disabled={submittingMeal}
              >
                {submittingMeal ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitMealBtnText}>Guardar en mi Diario</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Ver Foto de Comida en Grande y Guardar en Galería */}
      <Modal visible={!!selectedMealPhoto} transparent animationType="fade">
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalContent}>
            <View style={styles.photoModalHeader}>
              <View>
                <Text style={styles.photoModalTitle}>
                  {(selectedMealPhoto?.meal?.meal_type || 'COMIDA').toUpperCase()}
                </Text>
                {selectedMealPhoto?.meal && (
                  <Text style={styles.photoModalDate}>
                    {new Date(selectedMealPhoto.meal.logged_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}{' '}
                    •{' '}
                    {new Date(selectedMealPhoto.meal.logged_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setSelectedMealPhoto(null)}
                style={styles.closeModalBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {selectedMealPhoto && (
              <View style={styles.largeImageContainer}>
                <Image
                  source={{
                    uri: selectedMealPhoto.url,
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
                  }}
                  style={styles.largeImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {selectedMealPhoto?.meal?.description ? (
              <Text style={styles.mealModalNotes}>
                "{selectedMealPhoto.meal.description}"
              </Text>
            ) : null}

            {selectedMealPhoto && (
              <TouchableOpacity
                style={styles.saveGalleryBtn}
                onPress={() => handleSaveMealPhotoToGallery(selectedMealPhoto.url)}
                disabled={savingMealPhoto}
              >
                {savingMealPhoto ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Download size={18} color="#fff" />
                    <Text style={styles.saveGalleryBtnText}>Guardar Foto en Galería</Text>
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
  waterCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.85)',
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 16,
  },
  waterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  waterCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  waterCardSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  waterTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  waterBarTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: 14,
  },
  waterBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  waterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  waterBtn: {
    flex: 1,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
  },
  waterBtnText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  logMealBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logMealBtnText: {
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
  mealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 10,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealTypeBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  mealTypeBadgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  mealDate: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  mealDescription: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  typesGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  typeOptionActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: theme.colors.accent,
  },
  typeOptionText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  feelingsGrid: {
    gap: 8,
  },
  feelingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  feelingOptionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: theme.colors.success,
  },
  feelingOptionText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  feelingOptionTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  photoUploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  photoUploadText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  mealPhotoPreview: {
    width: '100%',
    height: 140,
    borderRadius: theme.radius.md,
  },
  notesInput: {
    backgroundColor: 'rgba(11, 15, 23, 0.7)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    height: 44,
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 14,
  },
  submitMealBtn: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitMealBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  mealBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  mealThumbContainer: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  mealThumbImage: {
    width: '100%',
    height: '100%',
  },
  mealZoomBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 3,
  },
  viewPhotoLink: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  viewPhotoLinkText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
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
    color: theme.colors.accent,
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
    height: 340,
    backgroundColor: '#000',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  mealModalNotes: {
    fontSize: 13,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: theme.radius.md,
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
