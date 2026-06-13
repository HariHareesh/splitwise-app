import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1DB954',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' }
    }}>
      <Tabs.Screen name="dashboard" options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
      }} />
      <Tabs.Screen name="groups" options={{
        title: 'Groups',
        tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />
      }} />
      <Tabs.Screen name="notifications" options={{
        title: 'Alerts',
        tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
      }} />
    </Tabs>
  );
}
