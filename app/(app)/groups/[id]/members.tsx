import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../../stores/api';
import { ENDPOINTS } from '../../../../constants/api';

export default function MembersScreen() {
  const { id } = useLocalSearchParams();
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await api.get(ENDPOINTS.GROUP_MEMBERS(Number(id)));
      setMembers(res.data);
    } catch {}
  };

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await api.get(`${ENDPOINTS.USER_SEARCH}?q=${q}`);
      setSearchResults(res.data);
    } catch {}
  };

  const addMember = async (userId: number) => {
    setLoading(true);
    try {
      await api.post(ENDPOINTS.GROUP_MEMBERS(Number(id)), { user_id: userId });
      setSearchQuery('');
      setSearchResults([]);
      await fetchMembers();
      Alert.alert('Success', 'Member added!');
    } catch {
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId: number, userName: string) => {
    Alert.alert('Remove Member', `Remove ${userName} from the group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(ENDPOINTS.GROUP_MEMBER_REMOVE(Number(id), userId));
            await fetchMembers();
            Alert.alert('Success', 'Member removed!');
          } catch {
            Alert.alert('Error', 'Failed to remove member');
          }
        }
      }
    ]);
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1DB954', '#1aa84a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Members</Text>
          <Text style={styles.memberCount}>{members.length}</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#1DB954" />
          <TextInput
            style={styles.searchInput}
            placeholder="Add users..."
            placeholderTextColor="#bbb"
            value={searchQuery}
            onChangeText={searchUsers}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
              <Ionicons name="close-circle" size={18} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchItem}
                onPress={() => addMember(item.id)}
                disabled={loading}
              >
                <View style={styles.searchItemContent}>
                  <View style={styles.searchAvatar}>
                    <Text style={styles.searchAvatarText}>
                      {item.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.searchItemName}>{item.full_name}</Text>
                    <Text style={styles.searchItemUsername}>@{item.username}</Text>
                  </View>
                </View>
                <Ionicons name="add-circle" size={24} color="#1DB954" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.memberLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.user.full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.user.full_name}</Text>
                <Text style={styles.memberUsername}>@{item.user.username}</Text>
              </View>
            </View>
            <View style={styles.memberRight}>
              {item.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield" size={14} color="#1DB954" />
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
              {item.role !== 'admin' && (
                <TouchableOpacity
                  onPress={() => removeMember(item.user.id, item.user.full_name)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  memberCount: { fontSize: 14, fontWeight: '600', color: '#fff', backgroundColor: '#ffffff30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  searchResults: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchAvatarText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  searchItemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  searchItemUsername: { fontSize: 12, color: '#999', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingVertical: 12 },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  memberUsername: { fontSize: 12, color: '#999' },
  memberRight: {
    marginLeft: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  adminBadgeText: { fontSize: 12, fontWeight: '600', color: '#1DB954' },
});
