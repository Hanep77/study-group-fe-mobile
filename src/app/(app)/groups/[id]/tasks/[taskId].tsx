import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TextInput, Image, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  getTasks, getChecklists, toggleChecklist,
  addChecklist, deleteTask, updateTaskStatus,
} from '../../../../../services';
import { Task, ChecklistItem, TaskStatus } from '../../../../../types';

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress', in_progress: 'done', done: 'todo',
};
const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do', in_progress: 'In Progress', done: 'Done',
};
const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: '#6B7280', in_progress: '#F59E0B', done: '#22C55E',
};
const PRIORITY_COLOR: Record<string, string> = {
  low: '#22C55E', medium: '#F59E0B', high: '#EF4444',
};

export default function TaskDetailScreen() {
  const { id: groupId, taskId } = useLocalSearchParams<{ id: string; taskId: string }>();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [allTasks, items] = await Promise.all([
      getTasks(groupId),
      getChecklists(taskId),
    ]);
    const found = allTasks.find((t) => t.id === taskId) ?? null;
    setTask(found);
    setChecklists(items);
    setLoading(false);
    setRefreshing(false);
  }, [groupId, taskId]);

  useEffect(() => { load(); }, [load]);

  // Toggle checklist item
  const handleToggle = async (item: ChecklistItem) => {
    // Optimistic update
    setChecklists((prev) =>
      prev.map((c) => c.id === item.id ? { ...c, completed: !c.completed } : c)
    );
    await toggleChecklist(item.id, !item.completed);
  };

  // Add new checklist item
  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    setAddingItem(true);
    try {
      const created = await addChecklist(taskId, newItem.trim());
      setChecklists((prev) => [...prev, created]);
      setNewItem('');
    } finally {
      setAddingItem(false);
    }
  };

  // Change task status
  const handleStatusChange = async () => {
    if (!task) return;
    const next = STATUS_NEXT[task.status];
    setTask((prev) => prev ? { ...prev, status: next } : prev);
    await updateTaskStatus(taskId, next);
  };

  // Delete task
  const handleDelete = () => {
    Alert.alert('Hapus Task', 'Yakin ingin menghapus task ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          await deleteTask(taskId);
          router.back();
        },
      },
    ]);
  };

  // PLATFORM-SPECIFIC: Camera
  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Dibutuhkan', 'Izinkan akses kamera untuk mengambil foto');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      // TODO: upload to server when backend ready
    }
  };

  // PLATFORM-SPECIFIC: Gallery
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

  if (!task) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Task tidak ditemukan</Text>
    </View>
  );

  const completed = checklists.filter((c) => c.completed).length;
  const total = checklists.length;
  const progress = total > 0 ? completed / total : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <Stack.Screen options={{ title: 'Detail Task' }} />

      {/* Task Info */}
      <View style={styles.card}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        {task.description ? (
          <Text style={styles.taskDesc}>{task.description}</Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLOR[task.priority] + '20' }]}>
            <View style={[styles.dot, { backgroundColor: PRIORITY_COLOR[task.priority] }]} />
            <Text style={[styles.priorityText, { color: PRIORITY_COLOR[task.priority] }]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[task.status] + '20' }]}
            onPress={handleStatusChange}
          >
            <Text style={[styles.statusText, { color: STATUS_COLOR[task.status] }]}>
              {STATUS_LABEL[task.status]} ↺
            </Text>
          </TouchableOpacity>
        </View>

        {(task.assigned_to_name || task.due_date) && (
          <View style={styles.infoGrid}>
            {task.assigned_to_name && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Assignee</Text>
                <Text style={styles.infoValue}>{task.assigned_to_name}</Text>
              </View>
            )}
            {task.due_date && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Due Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(task.due_date).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Checklist */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Checklist</Text>
        {total > 0 && (
          <Text style={styles.checklistCount}>{completed}/{total}</Text>
        )}
      </View>

      {/* Progress Bar */}
      {total > 0 && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}

      <View style={styles.card}>
        {checklists.length === 0 && (
          <Text style={styles.emptyChecklist}>Belum ada checklist item</Text>
        )}
        {checklists.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.checklistItem, idx < checklists.length - 1 && styles.checklistBorder]}
            onPress={() => handleToggle(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.completed && styles.checkboxDone]}>
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checklistText, item.completed && styles.checklistTextDone]}>
              {item.item}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Add Item */}
        <View style={styles.addItemRow}>
          <TextInput
            style={styles.addItemInput}
            placeholder="Tambah item checklist..."
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addItemButton, (!newItem.trim() || addingItem) && { opacity: 0.4 }]}
            onPress={handleAddItem}
            disabled={!newItem.trim() || addingItem}
          >
            {addingItem
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.addItemButtonText}>+</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {/* PLATFORM-SPECIFIC: Foto Bukti */}
      <Text style={styles.sectionTitle}>Foto Bukti</Text>
      <Text style={styles.sectionSubtitle}>Fitur khusus mobile — ambil foto sebagai bukti pengerjaan</Text>

      <View style={styles.photoButtons}>
        <TouchableOpacity style={styles.photoBtn} onPress={handleCamera}>
          <Text style={styles.photoBtnIcon}>📷</Text>
          <Text style={styles.photoBtnText}>Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn} onPress={handleGallery}>
          <Text style={styles.photoBtnIcon}>🖼️</Text>
          <Text style={styles.photoBtnText}>Galeri</Text>
        </TouchableOpacity>
      </View>

      {photo && (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: photo }} style={styles.photoPreview} resizeMode="cover" />
          <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
            <Text style={styles.removePhotoText}>✕ Hapus foto</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Hapus Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15, color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 1 },
  taskTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  taskDesc: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontSize: 12, fontWeight: '600' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#374151' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  sectionSubtitle: { fontSize: 12, color: '#9CA3AF', marginBottom: 12, marginTop: -6 },
  checklistCount: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  checklistBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxDone: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checklistText: { fontSize: 14, color: '#374151', flex: 1 },
  checklistTextDone: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  emptyChecklist: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 },
  addItemRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 8 },
  addItemInput: { flex: 1, fontSize: 14, color: '#374151', padding: 8 },
  addItemButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  addItemButtonText: { color: '#fff', fontSize: 22, lineHeight: 26 },
  photoButtons: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  photoBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
  photoBtnIcon: { fontSize: 28, marginBottom: 6 },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  photoPreviewContainer: { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  photoPreview: { width: '100%', height: 220 },
  removePhoto: { backgroundColor: '#FEF2F2', padding: 10, alignItems: 'center' },
  removePhotoText: { color: '#EF4444', fontSize: 13, fontWeight: '500' },
  deleteButton: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#FCA5A5' },
  deleteText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
});
