import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getTasks, updateTaskStatus } from '../../../../../services';
import { Task, TaskStatus } from '../../../../../types';

const PRIORITY_COLOR: Record<string, string> = {
  low: '#22C55E', medium: '#F59E0B', high: '#EF4444',
};

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress', in_progress: 'done', done: 'todo',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do', in_progress: 'In Progress', done: 'Done',
};

export default function TaskListScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getTasks(groupId);
    setTasks(data);
    setLoading(false);
    setRefreshing(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (task: Task) => {
    const next = STATUS_NEXT[task.status];
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: next } : t))
    );
    await updateTaskStatus(task.id, next);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

  const counts = {
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Tasks' }} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
          />
        }
        ListHeaderComponent={
          <View style={styles.stats}>
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
              <View key={s} style={styles.statItem}>
                <Text style={[styles.statNumber, {
                  color: s === 'todo' ? '#6B7280' : s === 'in_progress' ? '#F59E0B' : '#22C55E'
                }]}>
                  {counts[s]}
                </Text>
                <Text style={styles.statLabel}>{STATUS_LABEL[s]}</Text>
              </View>
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/groups/${groupId}/tasks/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            </View>
            {item.description ? (
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.footer}>
              {item.due_date && (
                <Text style={styles.due}>
                  {new Date(item.due_date).toLocaleDateString('id-ID')}
                </Text>
              )}
              <TouchableOpacity
                style={styles.statusBadge}
                onPress={() => handleStatusChange(item)}
              >
                <Text style={styles.statusText}>{STATUS_LABEL[item.status]}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/(app)/groups/${groupId}/tasks/create`)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 1 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  title: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  desc: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  due: { fontSize: 12, color: '#6B7280' },
  statusBadge: { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '500', color: '#111827' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
