import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity
} from 'react-native';
import { createGroup } from '../../../services';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama grup harus diisi');
      return;
    }
    setLoading(true);
    try {
      await createGroup({ name: name.trim(), description: description.trim(), deadline: deadline || null });
      router.back();
    } catch {
      Alert.alert('Error', 'Gagal membuat grup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Nama Grup *</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: Tugas Besar PABP"
          value={name}
          onChangeText={setName}
          maxLength={80}
        />

        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Jelaskan tujuan grup ini..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Deadline (opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD  contoh: 2025-06-30"
          value={deadline}
          onChangeText={setDeadline}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Buat Grup</Text>
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
  container: { flexGrow: 1, padding: 24, backgroundColor: '#F9FAFB' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  textarea: { height: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 16, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#6B7280', fontSize: 15 },
});
