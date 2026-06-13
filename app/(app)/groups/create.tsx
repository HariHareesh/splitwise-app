import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import api from '../../../stores/api';
import { ENDPOINTS } from '../../../constants/api';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(ENDPOINTS.GROUPS, { name, description });
      router.replace(`/(app)/groups/${res.data.id}`);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Group</Text>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Group Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Trip to Goa"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Optional description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Group'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    backgroundColor: '#1DB954', padding: 24, paddingTop: 60,
    flexDirection: 'row', alignItems: 'center', gap: 16
  },
  back: { color: '#fff', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#eee'
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  btn: {
    backgroundColor: '#1DB954', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
