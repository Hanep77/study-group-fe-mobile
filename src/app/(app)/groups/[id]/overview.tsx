import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getOverview, updateOverview, getGroupDetail } from '../../../../services';
import { useAuth } from '../../../../context/AuthContext';
import { Overview, Group } from '../../../../types';

export default function OverviewScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [ov, grp] = await Promise.all([
      getOverview(groupId),
      getGroupDetail(groupId),
    ]);
    setOverview(ov);
    setContent(ov?.content ?? '');
    setGroup(grp);
    setLoading(false);
    setRefreshing(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Penjelasan tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateOverview(groupId, content.trim());
      setOverview(updated);
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const isCreator = group?.creator_id === user?.id;

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <Stack.Screen options={{ title: 'Penjelasan Tugas' }} />

      {editing ? (
        // Edit mode
        <View>
          <TextInput
            style={styles.editor}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholder="Tulis penjelasan tugas di sini..."
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => { setContent(overview?.content ?? ''); setEditing(false); }}
            >
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveText}>Simpan</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // View mode
        <View>
          {overview?.content ? (
            <View style={styles.card}>
              <Text style={styles.content}>{overview.content}</Text>
              {overview.updated_at && (
                <Text style={styles.updatedAt}>
                  Diperbarui: {new Date(overview.updated_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Belum ada penjelasan tugas</Text>
              {isCreator && (
                <Text style={styles.emptySubText}>Tap tombol edit untuk menambahkan</Text>
              )}
            </View>
          )}

          {isCreator && (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>
                {overview?.content ? 'Edit Penjelasan' : 'Tambah Penjelasan'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 20, elevation: 1, marginBottom: 16 },
  content: { fontSize: 15, color: '#374151', lineHeight: 26 },
  updatedAt: { fontSize: 11, color: '#9CA3AF', marginTop: 16, textAlign: 'right' },
  editor: { backgroundColor: '#fff', borderRadius: 14, padding: 20, fontSize: 15, lineHeight: 26, color: '#374151', minHeight: 300, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  editActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#6B7280', fontWeight: '600' },
  saveButton: { flex: 2, backgroundColor: '#4F46E5', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
  editButton: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center' },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptySubText: { fontSize: 13, color: '#9CA3AF', marginBottom: 32 },
});
