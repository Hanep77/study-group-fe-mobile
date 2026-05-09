import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { joinGroup } from '../../../services';

export default function JoinGroupScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Kode Grup harus diisi');
      return;
    }
    setLoading(true);
    try {
      await joinGroup(code.trim());
      Alert.alert('Berhasil', 'Kamu telah bergabung ke grup', [
        { text: 'OK', onPress: () => router.replace('/(app)/groups') }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal bergabung ke grup. Pastikan Kode Grup benar.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gabung Grup</Text>
          <Text style={styles.subtitle}>Masukkan Kode Grup yang diberikan oleh temanmu</Text>
        </View>

        <Text style={styles.label}>Kode Grup</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: AB12CD"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Gabung Sekarang</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tip: Mintalah pembuat grup untuk memberikan Kode Grup yang tertera di halaman detail grup mereka.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#F9FAFB', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 18, fontWeight: '700', borderWidth: 1, borderColor: '#E5E7EB', textAlign: 'center', letterSpacing: 2 },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 16, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#6B7280', fontSize: 15 },
  infoBox: { marginTop: 40, padding: 16, backgroundColor: '#EEF2FF', borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE' },
  infoText: { fontSize: 13, color: '#4338CA', lineHeight: 20 },
});
