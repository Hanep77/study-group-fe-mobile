import { Tabs } from 'expo-router';
import { NavigationBar } from '../../components/NavigationBar';

export default function AppLayout() {
  return (
    <Tabs 
      tabBar={(props) => <NavigationBar {...props} />}
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="groups"
        options={{ title: 'Grup', tabBarLabel: 'Grup' }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Tugas Saya', tabBarLabel: 'Tugas Saya' }}
      />
    </Tabs>
  );
}
