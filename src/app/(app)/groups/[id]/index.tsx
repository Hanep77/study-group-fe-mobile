import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getGroupDetail, getMembers, deleteGroup } from '../../../../services';
import { useAuth } from '../../../../context/AuthContext';
import { Group, Member } from '../../../../types';

export default function GroupDetailScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [groupData, memberData] = await Promise.all([
      getGroupDetail(groupId),
      getMembers(groupId),
    ]);
    setGroup(groupData);
    setMembers(memberData);
    setLoading(false);
    setRefreshing(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteGroup = () => {
    Alert.alert('Hapus Grup', 'Yakin ingin menghapus grup ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          await deleteGroup(groupId);
          router.back();
        },
      },
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

  if (!group) return null;

  const isCreator = group.creator_id === user?.id;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <Stack.Screen options={{ title: group.name }} />

      {/* Group Info */}
      <View style={styles.card}>
        <Text style={styles.groupName}>{group.name}</Text>
        {group.description ? (
          <Text style={styles.desc}>{group.description}</Text>
        ) : null}
        {group.deadline && (
          <View style={styles.deadlineRow}>
            <Text style={styles.deadlineLabel}>Deadline</Text>
            <Text style={styles.deadlineValue}>
              {new Date(group.deadline).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Menu</Text>
      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push(`/(app)/groups/${groupId}/overview`)}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuLabel}>Penjelasan Tugas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push(`/(app)/groups/${groupId}/tasks`)}
        >
          <Text style={styles.menuIcon}>✅</Text>
          <Text style={styles.menuLabel}>Todo List</Text>
        </TouchableOpacity>
      </View>

      {/* Members */}
      <Text style={styles.sectionTitle}>Anggota ({members.length})</Text>
      <View style={styles.card}>
        {members.map((member, idx) => (
          <View key={member.id} style={[styles.memberRow, idx < members.length - 1 && styles.memberBorder]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
            {member.role === 'creator' && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Creator</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Danger Zone */}
      {isCreator && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGroup}>
          <Text style={styles.deleteText}>Hapus Grup</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 1 },
  groupName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  desc: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 12 },
  deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  deadlineLabel: { fontSize: 13, color: '#6B7280' },
  deadlineValue: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  menuGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  menuItem: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center', elevation: 1 },
  menuIcon: { fontSize: 28, marginBottom: 8 },
  menuLabel: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'center' },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },
  memberName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  memberEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  roleBadge: { backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  roleText: { fontSize: 11, fontWeight: '600', color: '#4F46E5' },
  deleteButton: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#FCA5A5' },
  deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
});
