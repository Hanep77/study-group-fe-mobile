import { Tabs } from 'expo-router';

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4F46E5', tabBarInactiveTintColor: '#9CA3AF' }}>
      <Tabs.Screen
        name="groups"
        options={{ title: 'Grup', tabBarLabel: 'Grup', headerShown: false }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Tugas Saya', tabBarLabel: 'Tugas Saya' }}
      />
    </Tabs>
  );
}
