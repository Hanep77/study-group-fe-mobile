import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { createTask, getMembers } from '../../../../../services';
import { Member, Priority } from '../../../../../types';

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#22C55E' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
];

export default function CreateTaskScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMembers(groupId).then(setMembers);
  }, [groupId]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Judul task harus diisi');
      return;
    }
    setLoading(true);
    try {
      await createTask(groupId, {
        title: title.trim(),
        description: description.trim(),
        assigned_to: assignedTo,
        priority,
        due_date: dueDate || null,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Gagal membuat task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: 'Buat Task' }} />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Title */}
        <Text style={styles.label}>Judul Task *</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: Setup database schema"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />

        {/* Description */}
        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Jelaskan detail task ini..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Priority */}
        <Text style={styles.label}>Prioritas</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.priorityBtn,
                priority === p.value && { backgroundColor: p.color, borderColor: p.color },
              ]}
              onPress={() => setPriority(p.value)}
            >
              <Text style={[
                styles.priorityText,
                priority === p.value && { color: '#fff' },
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Assign To */}
        <Text style={styles.label}>Assign ke</Text>
        <View style={styles.memberList}>
          <TouchableOpacity
            style={[styles.memberBtn, assignedTo === null && styles.memberBtnActive]}
            onPress={() => setAssignedTo(null)}
          >
            <Text style={[styles.memberBtnText, assignedTo === null && styles.memberBtnTextActive]}>
              Tidak ada
            </Text>
          </TouchableOpacity>
          {members.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.memberBtn, assignedTo === m.id && styles.memberBtnActive]}
              onPress={() => setAssignedTo(m.id)}
            >
              <Text style={[styles.memberBtnText, assignedTo === m.id && styles.memberBtnTextActive]}>
                {m.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Due Date */}
        <Text style={styles.label}>Due Date (opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD  contoh: 2025-05-30"
          value={dueDate}
          onChangeText={setDueDate}
          keyboardType="numeric"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Buat Task</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F9FAFB' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 20 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB', color: '#111827' },
  textarea: { height: 100, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#fff' },
  priorityText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  memberList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  memberBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  memberBtnText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  memberBtnTextActive: { color: '#fff' },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  cancelText: { color: '#6B7280', fontSize: 15 },
});
