import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Group } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { getMyGroups } from '@/src/services';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const load = useCallback(async () => {
    const data = await getMyGroups();
    setGroups(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Halo, {user?.name} 👋</Text>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.logout}>Keluar</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Belum ada grup</Text>
            <Text style={styles.emptySubText}>Buat grup baru untuk memulai</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/groups/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.row}>
              <Text style={styles.groupName}>{item.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.member_count} anggota</Text>
              </View>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            {item.deadline && (
              <Text style={styles.deadline}>
                Deadline: {new Date(item.deadline).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/groups/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '600', color: '#111827' },
  logout: { color: '#EF4444', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  groupName: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
  badge: { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, color: '#6B7280' },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  deadline: { fontSize: 12, color: '#4F46E5', fontWeight: '500' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, fontWeight: '500', color: '#111827', marginBottom: 4 },
  emptySubText: { fontSize: 13, color: '#6B7280' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
