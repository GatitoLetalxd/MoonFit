import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { offlineStorage } from '../utils/offlineStorage';
import {
  workoutsApi,
  nutritionApi,
  progressApi,
  remindersApi,
  routinesApi,
  goalsApi,
} from '../api/services';
import { SyncActionType, SyncQueueItem } from '../types';

interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncQueue: SyncQueueItem[];
  enqueueAction: (type: SyncActionType, payload: any) => Promise<SyncQueueItem>;
  processSyncQueue: () => Promise<void>;
  warmUpCache: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const isSyncingRef = useRef<boolean>(false);

  // Cargar cola inicial
  const refreshQueueState = useCallback(async () => {
    const queue = await offlineStorage.getSyncQueue();
    setSyncQueue(queue);
  }, []);

  // Descarga y cachea datos del servidor cuando hay internet para asegurar disponibilidad offline
  const warmUpCache = useCallback(async () => {
    try {
      const [rRes, wRes, waterRes, gRes, remRes] = await Promise.allSettled([
        routinesApi.getRoutines(),
        workoutsApi.getHistory(),
        nutritionApi.getTodayWater(),
        goalsApi.getActiveGoal(),
        remindersApi.getReminders(),
      ]);

      if (rRes.status === 'fulfilled' && rRes.value.data) {
        const raw = rRes.value.data;
        let list: any[] = [];
        if (Array.isArray(raw)) list = raw;
        else if (typeof raw === 'object') list = [...((raw as any).assigned || []), ...((raw as any).catalog || [])];
        if (list.length > 0) await offlineStorage.saveCachedRoutines(list);
      }

      if (wRes.status === 'fulfilled' && wRes.value.data && Array.isArray(wRes.value.data)) {
        await offlineStorage.saveCachedWorkouts(wRes.value.data);
      }

      if (waterRes.status === 'fulfilled' && waterRes.value.data) {
        await offlineStorage.saveCachedWater(waterRes.value.data);
      }

      if (gRes.status === 'fulfilled' && gRes.value.data) {
        await offlineStorage.saveCachedGoal(gRes.value.data);
      }

      if (remRes.status === 'fulfilled' && remRes.value.data && Array.isArray(remRes.value.data)) {
        await offlineStorage.saveCachedReminders(remRes.value.data);
      }
    } catch (e) {
      console.warn('Silent cache warm-up error:', e);
    }
  }, []);

  // Procesamiento de la cola de sincronización
  const processSyncQueue = useCallback(async () => {
    if (isSyncingRef.current) return;

    const net = await NetInfo.fetch();
    const online = Boolean(net.isConnected && net.isInternetReachable !== false);
    setIsOnline(online);
    if (!online) return;

    const queue = await offlineStorage.getSyncQueue();
    if (queue.length === 0) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    // Ordenar: primero registros de datos ligeros (JSON), fotos pesadas al final
    const sortedQueue = [...queue].sort((a, b) => {
      if (a.type === 'UPLOAD_PROGRESS_PHOTO' && b.type !== 'UPLOAD_PROGRESS_PHOTO') return 1;
      if (a.type !== 'UPLOAD_PROGRESS_PHOTO' && b.type === 'UPLOAD_PROGRESS_PHOTO') return -1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    for (const item of sortedQueue) {
      try {
        switch (item.type) {
          case 'LOG_WORKOUT': {
            await workoutsApi.log(item.payload);
            break;
          }
          case 'LOG_WATER': {
            await nutritionApi.logWater(item.payload.amount_ml);
            break;
          }
          case 'LOG_WEIGHT': {
            await progressApi.logWeight({
              weight_kg: item.payload.weight_kg,
              notes: item.payload.notes,
              date: item.payload.loggedAt,
            });
            break;
          }
          case 'UPDATE_REMINDER': {
            await remindersApi.updateReminder(item.payload.id, item.payload.data);
            break;
          }
          case 'UPLOAD_PROGRESS_PHOTO': {
            if (item.payload.localUri) {
              const formData = new FormData();
              const filename = item.payload.localUri.split('/').pop() || 'progress.jpg';
              const match = /\.(\w+)$/.exec(filename);
              const type = match ? `image/${match[1]}` : `image/jpeg`;
              formData.append('photo', {
                uri: item.payload.localUri,
                name: filename,
                type,
              } as any);
              await progressApi.uploadPhoto(formData);
            }
            break;
          }
          default:
            break;
        }

        // Si fue exitoso, remover de la cola
        await offlineStorage.removeFromQueue(item.id);
      } catch (error: any) {
        console.warn(`Sync item ${item.id} (${item.type}) failed:`, error?.message);

        // Incrementar contador de reintentos
        const newRetries = await offlineStorage.incrementQueueItemRetry(item.id);

        const status = error?.response?.status;
        const isClientError = status && status >= 400 && status < 500 && status !== 408 && status !== 429;

        // Si es un error 4xx irrecuperable o ya superó 5 reintentos fallidos, descartar de la cola
        if (isClientError || newRetries >= 5) {
          console.log(`Descartando item ${item.id} de la cola tras ${newRetries} intentos.`);
          await offlineStorage.removeFromQueue(item.id);
        } else {
          // Si es un fallo de red temporal o 5xx, detener la iteración y esperar siguiente reconexión
          break;
        }
      }
    }

    await refreshQueueState();
    await warmUpCache();

    isSyncingRef.current = false;
    setIsSyncing(false);
  }, [refreshQueueState, warmUpCache]);

  // Encolar acción para sincronización
  const enqueueAction = useCallback(
    async (type: SyncActionType, payload: any): Promise<SyncQueueItem> => {
      const item = await offlineStorage.addToQueue(type, payload);
      await refreshQueueState();

      // Si estamos online, intentar procesar inmediatamente
      if (isOnline) {
        setTimeout(() => {
          processSyncQueue();
        }, 300);
      }

      return item;
    },
    [isOnline, processSyncQueue, refreshQueueState]
  );

  // Escuchar cambios de conectividad de red
  useEffect(() => {
    refreshQueueState();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      if (online) {
        processSyncQueue();
      }
    });

    // Escuchar cuando la app regresa del segundo plano
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        processSyncQueue();
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribe();
      appStateSub.remove();
    };
  }, [processSyncQueue, refreshQueueState]);

  return (
    <SyncContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingCount: syncQueue.length,
        syncQueue,
        enqueueAction,
        processSyncQueue,
        warmUpCache,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
