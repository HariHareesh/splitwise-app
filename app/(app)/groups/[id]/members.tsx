import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    try {
      await api.post(ENDPOINTS.GROUP_MEMBERS(Number(id)), { user_id: userId });
      setSearchQuery('');
      setSearchResults([]);
      fetchMembers();
      Alert.alert('Success', 'Member added!');
    } catch {
      Alert.alert('Error', 'Failed to add member');
    }
  };

  const removeMember = async (userId: number) => {
    Alert.alert('Remove Member', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await api.delete(ENDPOINTS.GROUP_MEMBER_REMOVE(Number(id), userId));
            fetchMembers();
          } catch { Alert.alert('Error', 'Failed to remove member'); }
        }
      }
    ]);
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Members</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users to add..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={searchUsers}
        />
      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          {searchResults.map((user) => (
            <TouchableOpacity key={user.id} style={styles.searchItem} onPress={() => addMember(user.id)}>
              <Text style={styles.searchItemText}>@{user.username} — {user.full_name}</Text>
              <Ionicons name="add-circle" size={22} color="#1DB954" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.user.full_name || item.user.username)[0].toUpperCase()}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.user.full_name || item.user.username}</Text>
              <Text style={styles.memberRole}>{item.role}</Text>
            </View>
            {item.role !== 'admin' && (
              <TouchableOpacity onPress={() => removeMember(item.user.id)}>
                <Ionicons name="remove-circle-outline" size={22} color="#ff4444" />
              </TouchableOpacity>
            )}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchBox: { padding: 16 },
  searchInput: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    fontSize: 15, borderWidth: 1, borderColor: '#eee'
  },
  searchResults: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  searchItem: {
    padding: 14, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  searchItemText: { fontSize: 14, color: '#333' },
  list: { padding: 16 },
  memberCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center'
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#333' },
  memberRole: { fontSize: 12, color: '#999', marginTop: 2, textTransform: 'capitalize' },
});
