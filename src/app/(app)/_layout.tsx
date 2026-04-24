import { Tabs } from 'expo-router';
import { NavigationBar } from '../../components/NavigationBar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top']}>
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
    </SafeAreaView>
  );
}
