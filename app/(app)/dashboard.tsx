import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '../../stores/api';
import { useAuthStore } from '../../stores/authStore';
import { ENDPOINTS } from '../../constants/api';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.GROUPS);
      setGroups(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchGroups(); }, []);

  const formatBalance = (balance: number) => {
    return balance >= 0 ? `+₹${Math.abs(balance)}` : `-₹${Math.abs(balance)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#1DB954', '#1aa84a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.greeting}>Hi, {user?.full_name || user?.username}! 👋</Text>
          <Text style={styles.subtitle}>Manage your shared expenses</Text>
        </LinearGradient>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchGroups}
            tintColor="#1DB954"
            colors={['#1DB954']}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people" size={64} color="#1DB954" />
            </View>
            <Text style={styles.emptyText}>No groups yet!</Text>
            <Text style={styles.emptySubText}>Tap the + button to create a group and start splitting expenses</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/groups/${item.id}`)}>
            <View style={styles.cardTop}>
              <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Ionicons name="people" size={12} color="#666" />
                      <Text style={styles.badgeText}>{item.member_count} members</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#bbb" />
            </View>
            {item.total_balance !== undefined && (
              <View style={styles.balanceRow}>
                <Text style={[
                  styles.balance,
                  item.total_balance > 0 ? styles.balancePositive : styles.balanceNegative
                ]}>
                  {formatBalance(item.total_balance)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/groups/create')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  headerContainer: { overflow: 'hidden' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#fff', opacity: 0.9 },
  list: { paddingHorizontal: 16, paddingVertical: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: { fontSize: 12, color: '#666', fontWeight: '500' },
  balanceRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  balance: { fontSize: 14, fontWeight: '600' },
  balancePositive: { color: '#1DB954' },
  balanceNegative: { color: '#dc3545' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyIconContainer: { marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 32 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
