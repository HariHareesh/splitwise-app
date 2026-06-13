import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import api from '../../stores/api';
import { ENDPOINTS } from '../../constants/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.NOTIFICATIONS);
      setNotifications(res.data);
    } catch {}
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      await api.put(ENDPOINTS.MARK_ALL_READ);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notifications yet!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.is_read && styles.unread]}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>{item.body}</Text>
            <Text style={styles.cardTime}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    backgroundColor: '#1DB954', padding: 24, paddingTop: 60,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  markAll: { fontSize: 13, color: '#fff', opacity: 0.9 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginTop: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  unread: { borderLeftWidth: 4, borderLeftColor: '#1DB954' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardBody: { fontSize: 13, color: '#666', marginTop: 4 },
  cardTime: { fontSize: 11, color: '#999', marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#999' },
});
