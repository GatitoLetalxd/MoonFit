import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as FileSystem from 'expo-file-system/legacy';
import { Header } from '../../components/common/Header';
import { useNotification } from '../../context/NotificationContext';
import { adminApi, progressApi, nutritionApi, usersApi } from '../../api/services';
import { AdminUserDetail, ProgressPhoto, Meal } from '../../types';
import { theme } from '../../theme';
import {
  Dumbbell,
  Camera,
  Utensils,
  Scale,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Maximize2,
  X,
  Send,
  MessageSquare,
  Award,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';

export const AdminUserDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { showToast, triggerHaptic } = useNotification();

  const userId = route.params?.userId;
  const initialName = route.params?.userName || 'Detalle del Alumno';

  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'WORKOUTS' | 'PHOTOS' | 'MEALS' | 'WEIGHT'>('WORKOUTS');

  // Token para renderizar imágenes protegidas
  const [authToken, setAuthToken] = useState<string>('');
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

  // Modales de visualización de fotos (Progreso y Comidas)
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [savingPhoto, setSavingPhoto] = useState<boolean>(false);

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [savingMealPhoto, setSavingMealPhoto] = useState<boolean>(false);

  // Feedback del Admin
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [sendingFeedback, setSendingFeedback] = useState<boolean>(false);

  const loadData = async () => {
    if (!userId) return;
    try {
      const [token, res] = await Promise.all([
        AsyncStorage.getItem('@moonfit_access_token'),
        adminApi.getUserDetail(userId),
      ]);
      if (token) setAuthToken(token);
      if (res.data) {
        setUserDetail(res.data);
      }
      setAvatarTimestamp(Date.now());
    } catch (e: any) {
      showToast('Error cargando perfil', e.message || 'No se pudo obtener la información', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      showToast('Mensaje requerido', 'Escribe un mensaje o recomendación para el alumno.', 'warning');
      return;
    }

    try {
      setSendingFeedback(true);
      await adminApi.sendFeedback(userId, feedbackText.trim());
      showToast('Feedback Enviado', 'El alumno verá tu mensaje en su pantalla de inicio.', 'success');
      triggerHaptic('success');
      setFeedbackText('');
      loadData();
    } catch (e: any) {
      showToast('Error al enviar feedback', e.message, 'error');
    } finally {
      setSendingFeedback(false);
    }
  };

  const handleSavePhotoToGallery = async (photoId: string) => {
    try {
      triggerHaptic('light');
      setSavingPhoto(true);

      let perm = await MediaLibrary.getPermissionsAsync();
      if (!perm.granted && perm.status !== 'granted') {
        perm = await MediaLibrary.requestPermissionsAsync();
      }
      if (!perm.granted && perm.status !== 'granted') {
        showToast('Permiso Requerido', 'Necesitamos acceso a la galería para guardar la foto.', 'warning');
        setSavingPhoto(false);
        return;
      }

      showToast('Descargando...', 'Guardando foto de progreso en tu galería.', 'info');
      const token = authToken || (await AsyncStorage.getItem('@moonfit_access_token'));
      const photoUrl = progressApi.getPhotoViewUrl(photoId, token);
      const filename = `moonfit_alumno_progreso_${photoId}_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${filename}`;

      const downloadRes = await FileSystem.downloadAsync(photoUrl, fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (downloadRes.status === 200) {
        try {
          await MediaLibrary.createAssetAsync(downloadRes.uri);
        } catch {
          await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
        }
        await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        showToast('¡Foto Guardada!', 'La imagen se guardó exitosamente en la galería.', 'success');
        triggerHaptic('success');
      } else {
        showToast('Error', 'No se pudo descargar la imagen del servidor.', 'error');
      }
    } catch (e: any) {
      showToast('Error al Guardar', e.message || 'No se pudo guardar la imagen.', 'error');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleSaveMealPhotoToGallery = async (photoId: string) => {
    try {
      triggerHaptic('light');
      setSavingMealPhoto(true);

      let perm = await MediaLibrary.getPermissionsAsync();
      if (!perm.granted && perm.status !== 'granted') {
        perm = await MediaLibrary.requestPermissionsAsync();
      }
      if (!perm.granted && perm.status !== 'granted') {
        showToast('Permiso Requerido', 'Necesitamos acceso a la galería para guardar la foto.', 'warning');
        setSavingMealPhoto(false);
        return;
      }

      showToast('Descargando...', 'Guardando foto de comida en tu galería.', 'info');
      const token = authToken || (await AsyncStorage.getItem('@moonfit_access_token'));
      const photoUrl = nutritionApi.getMealPhotoViewUrl(photoId, token);
      const filename = `moonfit_alumno_comida_${photoId}_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${filename}`;

      const downloadRes = await FileSystem.downloadAsync(photoUrl, fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (downloadRes.status === 200) {
        try {
          await MediaLibrary.createAssetAsync(downloadRes.uri);
        } catch {
          await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
        }
        await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        showToast('¡Foto Guardada!', 'La foto del plato se guardó en tu galería.', 'success');
        triggerHaptic('success');
      } else {
        showToast('Error', 'No se pudo descargar la imagen del servidor.', 'error');
      }
    } catch (e: any) {
      showToast('Error al Guardar', e.message || 'No se pudo guardar la imagen.', 'error');
    } finally {
      setSavingMealPhoto(false);
    }
  };

  const initials = userDetail?.name
    ? userDetail.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AL';

  const heightM = (userDetail?.height_cm || 170) / 100;
  const currentWeight = userDetail?.initial_weight_kg || 70;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);

  return (
    <View style={styles.container}>
      <Header
        title={userDetail?.name || initialName}
        subtitle="Seguimiento detallado del alumno"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSyncBadge={true}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.colors.primary} />}
      >
        {/* User Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarCircle}>
              {userDetail?.avatar_url && userDetail?.id ? (
                <Image
                  source={{ uri: `${usersApi.getAvatarUrl(userDetail.id)}?t=${avatarTimestamp}` }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{userDetail?.name || initialName}</Text>
              <Text style={styles.profileEmail}>{userDetail?.email}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, userDetail?.active ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={[styles.statusBadgeText, userDetail?.active ? { color: '#34d399' } : { color: '#fbbf24' }]}>
                    {userDetail?.active ? 'CUENTA ACTIVA' : 'INACTIVA'}
                  </Text>
                </View>
                {userDetail?.created_at && (
                  <Text style={styles.joinDate}>
                    Desde {new Date(userDetail.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Profile Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{userDetail?.height_cm ? `${userDetail.height_cm} cm` : '--'}</Text>
              <Text style={styles.metricLbl}>Estatura</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{userDetail?.initial_weight_kg ? `${userDetail.initial_weight_kg} kg` : '--'}</Text>
              <Text style={styles.metricLbl}>Peso Inicial</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricVal}>{userDetail?.age ? `${userDetail.age} años` : '--'}</Text>
              <Text style={styles.metricLbl}>Edad</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricVal, { color: theme.colors.primary }]}>{bmi}</Text>
              <Text style={styles.metricLbl}>IMC Estimado</Text>
            </View>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsRow}>
          {[
            { id: 'WORKOUTS', label: 'Rutinas', icon: Dumbbell, count: userDetail?.workout_logs?.length || 0 },
            { id: 'PHOTOS', label: 'Fotos', icon: Camera, count: userDetail?.progress_photos?.length || 0 },
            { id: 'MEALS', label: 'Comidas', icon: Utensils, count: userDetail?.meals?.length || 0 },
            { id: 'WEIGHT', label: 'Pesajes', icon: Scale, count: userDetail?.weekly_weight_logs?.length || 0 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                onPress={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as any);
                }}
              >
                <Icon size={16} color={isSelected ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TAB 1: WORKOUTS */}
        {activeTab === 'WORKOUTS' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.tabSectionTitle}>
              HISTORIAL DE ENTRENAMIENTOS REALIZADOS
            </Text>

            {loading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : !userDetail?.workout_logs || userDetail.workout_logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Dumbbell size={32} color={theme.colors.textDim} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyStateText}>Este alumno aún no ha registrado entrenamientos.</Text>
              </View>
            ) : (
              userDetail.workout_logs.map((w) => {
                const isCompleted = w.status !== 'CANCELADA';
                const durationMin = w.duration_seconds ? Math.max(1, Math.round(w.duration_seconds / 60)) : null;

                return (
                  <View key={w.id} style={[styles.workoutCard, !isCompleted && styles.workoutCardCanceled]}>
                    <View style={styles.workoutCardHeader}>
                      <View style={[styles.workoutIconCircle, isCompleted ? styles.circleSuccess : styles.circleWarning]}>
                        {isCompleted ? <CheckCircle2 size={16} color={theme.colors.success} /> : <XCircle size={16} color={theme.colors.warning} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.workoutTitle}>{w.routine?.name || 'Rutina'}</Text>
                        <View style={styles.tagsRow}>
                          <View style={[styles.statusPill, isCompleted ? styles.statusPillSuccess : styles.statusPillWarning]}>
                            <Text style={[styles.statusPillText, isCompleted ? { color: '#34d399' } : { color: '#fbbf24' }]}>
                              {isCompleted ? 'COMPLETADA' : 'CANCELADA'}
                            </Text>
                          </View>
                          {w.routine?.type ? (
                            <View style={styles.typePill}>
                              <Text style={styles.typePillText}>{w.routine.type}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    <View style={styles.workoutMetaRow}>
                      <View style={styles.metaItem}>
                        <Calendar size={12} color={theme.colors.textMuted} />
                        <Text style={styles.metaText}>
                          {new Date(w.completed_at).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          •{' '}
                          {new Date(w.completed_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>

                      {durationMin !== null && (
                        <View style={styles.metaItem}>
                          <Clock size={12} color={theme.colors.accent} />
                          <Text style={[styles.metaText, { color: theme.colors.accent }]}>
                            {durationMin} min
                          </Text>
                        </View>
                      )}

                      {w.exercises_completed !== null && w.exercises_completed !== undefined && w.total_exercises && (
                        <View style={styles.metaItem}>
                          <Dumbbell size={12} color={theme.colors.primary} />
                          <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                            {w.exercises_completed}/{w.total_exercises} ej.
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 2: PROGRESS PHOTOS */}
        {activeTab === 'PHOTOS' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.tabSectionTitle}>
              FOTOS DE EVOLUCIÓN FÍSICA ({userDetail?.progress_photos?.length || 0})
            </Text>

            {loading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : !userDetail?.progress_photos || userDetail.progress_photos.length === 0 ? (
              <View style={styles.emptyState}>
                <Camera size={32} color={theme.colors.textDim} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyStateText}>Este alumno aún no ha subido fotos de progreso.</Text>
              </View>
            ) : (
              <View style={styles.photosGrid}>
                {userDetail.progress_photos.map((p) => {
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.photoThumbCard}
                      onPress={() => {
                        triggerHaptic('light');
                        setSelectedPhoto(p);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{
                          uri: progressApi.getPhotoViewUrl(p.id, authToken),
                        }}
                        style={styles.thumbImage}
                        resizeMode="cover"
                      />
                      <View style={styles.thumbZoomBadge}>
                        <Maximize2 size={12} color="#fff" />
                      </View>
                      <View style={styles.thumbDateBar}>
                        <Text style={styles.thumbDateText}>
                          {new Date(p.taken_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: MEALS & NUTRITION */}
        {activeTab === 'MEALS' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.tabSectionTitle}>
              REGISTRO DE COMIDAS & FOTOS DEL PLATO ({userDetail?.meals?.length || 0})
            </Text>

            {loading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : !userDetail?.meals || userDetail.meals.length === 0 ? (
              <View style={styles.emptyState}>
                <Utensils size={32} color={theme.colors.textDim} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyStateText}>Este alumno aún no ha registrado comidas.</Text>
              </View>
            ) : (
              userDetail.meals.map((meal) => {
                const hasPhoto = meal.photos && meal.photos.length > 0;
                const photoId = hasPhoto ? meal.photos![0].id : null;

                return (
                  <View key={meal.id} style={styles.mealCard}>
                    <View style={styles.mealCardTop}>
                      {hasPhoto && photoId ? (
                        <TouchableOpacity
                          style={styles.mealThumbContainer}
                          onPress={() => {
                            triggerHaptic('light');
                            setSelectedMeal(meal);
                          }}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{
                              uri: nutritionApi.getMealPhotoViewUrl(photoId, authToken),
                            }}
                            style={styles.mealThumb}
                            resizeMode="cover"
                          />
                          <View style={styles.mealThumbBadge}>
                            <Maximize2 size={12} color="#fff" />
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.mealIconPlaceholder}>
                          <Utensils size={20} color={theme.colors.primary} />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.mealTypeBadge}>{(meal.meal_type || 'COMIDA').toUpperCase()}</Text>
                          <Text style={styles.mealTimeText}>
                            {new Date(meal.logged_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                            })}{' '}
                            •{' '}
                            {new Date(meal.logged_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>

                        <Text style={styles.mealDescription}>
                          {meal.description || 'Comida registrada sin descripción'}
                        </Text>

                        {hasPhoto && (
                          <TouchableOpacity
                            onPress={() => {
                              triggerHaptic('light');
                              setSelectedMeal(meal);
                            }}
                            style={styles.viewMealPhotoLink}
                          >
                            <Text style={styles.viewMealPhotoLinkText}>Ver foto del plato 🔍</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TAB 4: WEIGHT LOGS */}
        {activeTab === 'WEIGHT' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.tabSectionTitle}>
              HISTORIAL DE PESAJE SEMANAL ({userDetail?.weekly_weight_logs?.length || 0})
            </Text>

            {loading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : !userDetail?.weekly_weight_logs || userDetail.weekly_weight_logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Scale size={32} color={theme.colors.textDim} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyStateText}>Este alumno aún no tiene pesajes registrados.</Text>
              </View>
            ) : (
              userDetail.weekly_weight_logs.map((w) => {
                const diff =
                  userDetail.initial_weight_kg && w.weight_kg
                    ? (w.weight_kg - userDetail.initial_weight_kg).toFixed(1)
                    : null;

                return (
                  <View key={w.id} style={styles.weightCard}>
                    <View style={styles.weightIconCircle}>
                      <Scale size={18} color="#a78bfa" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.weightKg}>{w.weight_kg} kg</Text>
                      <Text style={styles.weightDate}>
                        Semana:{' '}
                        {new Date(w.week_start_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                      {w.notes ? <Text style={styles.weightNotes}>"{w.notes}"</Text> : null}
                    </View>

                    {diff !== null && (
                      <View
                        style={[
                          styles.weightDiffBadge,
                          parseFloat(diff) <= 0 ? styles.diffLoss : styles.diffGain,
                        ]}
                      >
                        {parseFloat(diff) <= 0 ? (
                          <TrendingDown size={14} color="#34d399" />
                        ) : (
                          <TrendingUp size={14} color="#fb923c" />
                        )}
                        <Text
                          style={[
                            styles.weightDiffText,
                            parseFloat(diff) <= 0 ? { color: '#34d399' } : { color: '#fb923c' },
                          ]}
                        >
                          {parseFloat(diff) > 0 ? `+${diff}` : `${diff}`} kg
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* COACH / ADMIN FEEDBACK SECTION */}
        <View style={styles.feedbackSection}>
          <View style={styles.feedbackHeader}>
            <MessageSquare size={18} color={theme.colors.primary} />
            <Text style={styles.feedbackHeading}>ENVIAR MENSAJE O FEEDBACK AL ALUMNO</Text>
          </View>

          <TextInput
            style={styles.feedbackInput}
            placeholder="Escribe una recomendación, felicitación o consejo de entrenamiento..."
            placeholderTextColor={theme.colors.textDim}
            value={feedbackText}
            onChangeText={setFeedbackText}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.sendFeedbackBtn, sendingFeedback && { opacity: 0.6 }]}
            onPress={handleSendFeedback}
            disabled={sendingFeedback}
            activeOpacity={0.8}
          >
            {sendingFeedback ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Send size={16} color="#fff" />
                <Text style={styles.sendFeedbackBtnText}>Enviar al Alumno</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Previous feedback history */}
          {userDetail?.received_feedback && userDetail.received_feedback.length > 0 && (
            <View style={styles.feedbackHistoryList}>
              <Text style={styles.feedbackHistoryHeading}>MENSAJES ENVIADOS RECIENTEMENTE:</Text>
              {userDetail.received_feedback.map((fb) => (
                <View key={fb.id} style={styles.feedbackItem}>
                  <Text style={styles.feedbackItemText}>"{fb.message}"</Text>
                  <Text style={styles.feedbackItemDate}>
                    {new Date(fb.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* FULLSCREEN MODAL: VISOR DE FOTO DE PROGRESO */}
      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Foto de Evolución Física</Text>
              <Text style={styles.modalSubtitle}>
                {selectedPhoto?.taken_at
                  ? new Date(selectedPhoto.taken_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedPhoto(null)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalImageWrapper}>
            {selectedPhoto && (
              <Image
                source={{
                  uri: progressApi.getPhotoViewUrl(selectedPhoto.id, authToken),
                }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.saveGalleryBtn}
              onPress={() => handleSavePhotoToGallery(selectedPhoto.id)}
              disabled={savingPhoto}
              activeOpacity={0.8}
            >
              {savingPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Download size={18} color="#fff" />
                  <Text style={styles.saveGalleryBtnText}>Guardar Foto en Mi Galería</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FULLSCREEN MODAL: VISOR DE FOTO DE COMIDA */}
      <Modal
        visible={!!selectedMeal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedMeal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {selectedMeal?.meal_type?.toUpperCase() || 'Foto de Comida'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {selectedMeal?.logged_at
                  ? new Date(selectedMeal.logged_at).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedMeal(null)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalImageWrapper}>
            {selectedMeal?.photos && selectedMeal.photos.length > 0 && (
              <Image
                source={{
                  uri: nutritionApi.getMealPhotoViewUrl(selectedMeal.photos[0].id, authToken),
                }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            )}
          </View>

          {selectedMeal?.description ? (
            <View style={styles.modalMealDescBox}>
              <Text style={styles.modalMealDescText}>"{selectedMeal.description}"</Text>
            </View>
          ) : null}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.saveGalleryBtn}
              onPress={() => {
                if (selectedMeal?.photos?.[0]?.id) {
                  handleSaveMealPhotoToGallery(selectedMeal.photos[0].id);
                }
              }}
              disabled={savingMealPhoto}
              activeOpacity={0.8}
            >
              {savingMealPhoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Download size={18} color="#fff" />
                  <Text style={styles.saveGalleryBtnText}>Guardar Foto del Plato en Galería</Text>
                </>
              )}
            </TouchableOpacity>
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
  profileCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.75)',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 16,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  joinDate: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  metricLbl: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: theme.colors.primary,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textDim,
  },
  tabBtnTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  tabContentSection: {
    marginBottom: 20,
  },
  tabSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  emptyStateText: {
    color: theme.colors.textDim,
    fontSize: 13,
  },
  workoutCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 10,
  },
  workoutCardCanceled: {
    opacity: 0.85,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workoutIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  circleWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  statusPillSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  typePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  typePillText: {
    fontSize: 9,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  workoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoThumbCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbZoomBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 6,
    padding: 4,
  },
  thumbDateBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  thumbDateText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  mealCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 10,
  },
  mealCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealThumbContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealThumb: {
    width: '100%',
    height: '100%',
  },
  mealThumbBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 4,
    padding: 3,
  },
  mealIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  mealTimeText: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  mealDescription: {
    fontSize: 13,
    color: '#fff',
    marginTop: 3,
  },
  viewMealPhotoLink: {
    marginTop: 4,
  },
  viewMealPhotoLinkText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  weightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 10,
    gap: 12,
  },
  weightIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightKg: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  weightDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  weightNotes: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontStyle: 'italic',
    marginTop: 2,
  },
  weightDiffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffLoss: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  diffGain: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  weightDiffText: {
    fontSize: 11,
    fontWeight: '800',
  },
  feedbackSection: {
    backgroundColor: 'rgba(23, 31, 48, 0.75)',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginTop: 10,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  feedbackHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  feedbackInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.radius.md,
    padding: 12,
    color: '#fff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 12,
  },
  sendFeedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
  },
  sendFeedbackBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackHistoryList: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  feedbackHistoryHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textDim,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  feedbackItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: theme.radius.sm,
    marginBottom: 6,
  },
  feedbackItemText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  feedbackItemDate: {
    fontSize: 10,
    color: theme.colors.textDim,
    marginTop: 4,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.96)',
    paddingTop: 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalFullImage: {
    width: '100%',
    height: '100%',
  },
  modalMealDescBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 10,
  },
  modalMealDescText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalActions: {
    paddingTop: 10,
  },
  saveGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
  },
  saveGalleryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
