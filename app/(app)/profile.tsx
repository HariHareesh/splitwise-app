import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const userInitials = (
    user?.full_name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || user?.username?.[0].toUpperCase() || '?'
  ).slice(0, 2);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1DB954', '#1aa84a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name || user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="person" size={18} color="#1DB954" />
              <Text style={styles.infoLabel}>Full Name</Text>
            </View>
            <Text style={styles.infoValue}>{user?.full_name || 'N/A'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="at" size={18} color="#1DB954" />
              <Text style={styles.infoLabel}>Username</Text>
            </View>
            <Text style={styles.infoValue}>@{user?.username}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="mail" size={18} color="#1DB954" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#1DB954' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#fff', opacity: 0.9 },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  logoutBtn: {
    backgroundColor: '#dc3545',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
