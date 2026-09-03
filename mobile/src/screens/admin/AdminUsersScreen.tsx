import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { useNotification } from '../../context/NotificationContext';
import { adminApi, usersApi } from '../../api/services';
import { AdminUserListItem } from '../../types';
import { theme } from '../../theme';
import {
  Search,
  Users,
  ChevronRight,
  Dumbbell,
  Camera,
  Utensils,
  Scale,
  Shield,
  Calendar,
  X,
} from 'lucide-react-native';

export const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast, triggerHaptic } = useNotification();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

  const loadUsers = async () => {
    try {
      const res = await adminApi.listUsers({ search: search.trim() || undefined, limit: 50 });
      if (res.data && Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      }
      setAvatarTimestamp(Date.now());
    } catch (e: any) {
      showToast('Error al cargar alumnos', e.message || 'No se pudo obtener la lista', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const handleSearchSubmit = () => {
    setLoading(true);
    loadUsers();
  };

  const handleClearSearch = () => {
    setSearch('');
    setLoading(true);
    adminApi.listUsers({ limit: 50 }).then((res) => {
      if (res.data?.users) setUsers(res.data.users);
      setLoading(false);
    });
  };

  const handleUserPress = (user: AdminUserListItem) => {
    triggerHaptic('light');
    navigation.navigate('AdminUserDetail', {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    });
  };

  // Filtrado local adicional para búsqueda instantánea
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const activeCount = users.filter((u) => u.active).length;

  return (
    <View style={styles.container}>
      <Header
        title="Panel de Supervisión"
        subtitle="Gestión y seguimiento de alumnos"
        showBack={true}
        onBack={() => navigation.goBack()}
        showSyncBadge={true}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadUsers} tintColor={theme.colors.primary} />}
      >
        {/* KPI Summary Banner */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Users size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.kpiValue}>{users.length}</Text>
            <Text style={styles.kpiLabel}>Total Alumnos</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Shield size={20} color={theme.colors.success} />
            </View>
            <Text style={styles.kpiValue}>{activeCount}</Text>
            <Text style={styles.kpiLabel}>Cuentas Activas</Text>
          </View>
        </View>

        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Search size={18} color={theme.colors.textDim} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o correo..."
            placeholderTextColor={theme.colors.textDim}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={{ padding: 10 }}>
              <X size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* User Cards List */}
        <View style={styles.usersList}>
          <Text style={styles.sectionHeader}>
            ALUMNOS REGISTRADOS ({filteredUsers.length})
          </Text>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Users size={36} color={theme.colors.textDim} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>No se encontraron alumnos</Text>
              <Text style={styles.emptySubtitle}>
                {search ? `Ningún usuario coincide con "${search}".` : 'No hay usuarios registrados aún.'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((item) => {
              const initials = item.name
                ? item.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'AL';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.userCard}
                  onPress={() => handleUserPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.userCardTop}>
                    <View style={styles.avatarCircle}>
                      {item.avatar_url ? (
                        <Image
                          source={{ uri: `${usersApi.getAvatarUrl(item.id)}?t=${avatarTimestamp}` }}
                          style={styles.avatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.avatarText}>{initials}</Text>
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.userName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={[styles.statusBadge, item.active ? styles.badgeActive : styles.badgeInactive]}>
                          <Text style={[styles.statusBadgeText, item.active ? { color: '#34d399' } : { color: '#fbbf24' }]}>
                            {item.active ? 'ACTIVO' : 'INACTIVO'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.userEmail} numberOfLines={1}>
                        {item.email}
                      </Text>

                      <View style={styles.dateRow}>
                        <Calendar size={11} color={theme.colors.textDim} />
                        <Text style={styles.dateText}>
                          Miembro desde {new Date(item.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>

                    <ChevronRight size={20} color={theme.colors.textDim} style={{ marginLeft: 8 }} />
                  </View>

                  {/* Summary Counters Strip */}
                  <View style={styles.countersStrip}>
                    <View style={styles.counterItem}>
                      <Dumbbell size={13} color={theme.colors.primary} />
                      <Text style={styles.counterValue}>
                        {item._count?.workout_logs || 0}
                      </Text>
                      <Text style={styles.counterLabel}>Rutinas</Text>
                    </View>

                    <View style={styles.counterDivider} />

                    <View style={styles.counterItem}>
                      <Camera size={13} color={theme.colors.accent} />
                      <Text style={styles.counterValue}>
                        {item._count?.progress_photos || 0}
                      </Text>
                      <Text style={styles.counterLabel}>Fotos</Text>
                    </View>

                    <View style={styles.counterDivider} />

                    <View style={styles.counterItem}>
                      <Utensils size={13} color="#34d399" />
                      <Text style={styles.counterValue}>
                        {item._count?.meals || 0}
                      </Text>
                      <Text style={styles.counterLabel}>Comidas</Text>
                    </View>

                    <View style={styles.counterDivider} />

                    <View style={styles.counterItem}>
                      <Scale size={13} color="#a78bfa" />
                      <Text style={styles.counterValue}>
                        {item._count?.weekly_weight_logs || 0}
                      </Text>
                      <Text style={styles.counterLabel}>Pesajes</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(23, 31, 48, 0.7)',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: '#fff',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  usersList: {},
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  centerBox: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.lg,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: 'rgba(23, 31, 48, 0.75)',
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 12,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 15,
    fontWeight: '900',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
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
  countersStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  counterValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  counterLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  counterDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
