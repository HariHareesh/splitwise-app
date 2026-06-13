import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Switch
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../../../stores/api';
import { ENDPOINTS } from '../../../../../constants/api';

export default function CreateExpenseScreen() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'unequal' | 'percentage' | 'share'>('equal');
  const [members, setMembers] = useState<any[]>([]);
  const [payers, setPayers] = useState<{ [key: number]: string }>({});
  const [splits, setSplits] = useState<{ [key: number]: string }>({});
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get(ENDPOINTS.GROUP_MEMBERS(Number(id)));
      setMembers(res.data);
    } catch {}
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!title || !amount || selectedMembers.length === 0) {
      Alert.alert('Error', 'Fill all fields and select at least one member');
      return;
    }

    const payersData = Object.entries(payers)
      .filter(([uid]) => selectedMembers.includes(Number(uid)))
      .map(([uid, amt]) => ({ user_id: Number(uid), amount_paid: Number(amt) }));

    if (payersData.length === 0) {
      Alert.alert('Error', 'Add at least one payer');
      return;
    }

    const splitsData = selectedMembers.map(uid => ({
      user_id: uid,
      split_value: splits[uid] ? Number(splits[uid]) : 0
    }));

    setLoading(true);
    try {
      await api.post(ENDPOINTS.EXPENSES(Number(id)), {
        title,
        total_amount: Number(amount),
        split_type: splitType,
        payers: payersData,
        splits: splitsData,
      });
      Alert.alert('Success', 'Expense created!');
      router.back();
    } catch (err: any) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create expense';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>New Expense</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} placeholder="e.g. Dinner" placeholderTextColor="#999"
          value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Total Amount (₹) *</Text>
        <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#999"
          value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

        <Text style={styles.label}>Split Type</Text>
        <View style={styles.splitRow}>
          {(['equal', 'unequal', 'percentage', 'share'] as const).map(type => (
            <TouchableOpacity key={type}
              style={[styles.splitBtn, splitType === type && styles.splitBtnActive]}
              onPress={() => setSplitType(type)}>
              <Text style={[styles.splitBtnText, splitType === type && styles.splitBtnTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Select Members *</Text>
        {members.map(m => (
          <View key={m.user.id} style={styles.memberRow}>
            <TouchableOpacity style={styles.memberCheck} onPress={() => toggleMember(m.user.id)}>
              <Ionicons
                name={selectedMembers.includes(m.user.id) ? 'checkbox' : 'square-outline'}
                size={22} color="#1DB954" />
              <Text style={styles.memberName}>{m.user.full_name || m.user.username}</Text>
            </TouchableOpacity>

            {selectedMembers.includes(m.user.id) && splitType !== 'equal' && (
              <TextInput
                style={styles.splitInput}
                placeholder={splitType === 'percentage' ? '%' : splitType === 'share' ? 'shares' : '₹'}
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={splits[m.user.id] || ''}
                onChangeText={(v) => setSplits(prev => ({ ...prev, [m.user.id]: v }))}
              />
            )}
          </View>
        ))}

        <Text style={styles.label}>Who Paid?</Text>
        {members.filter(m => selectedMembers.includes(m.user.id)).map(m => (
          <View key={m.user.id} style={styles.payerRow}>
            <Text style={styles.payerName}>{m.user.full_name || m.user.username}</Text>
            <TextInput
              style={styles.payerInput}
              placeholder="₹0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={payers[m.user.id] || ''}
              onChangeText={(v) => setPayers(prev => ({ ...prev, [m.user.id]: v }))}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Expense'}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#eee'
  },
  splitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  splitBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff'
  },
  splitBtnActive: { borderColor: '#1DB954', backgroundColor: '#f0fff4' },
  splitBtnText: { fontSize: 13, color: '#666' },
  splitBtnTextActive: { color: '#1DB954', fontWeight: '600' },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8
  },
  memberCheck: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { fontSize: 15, color: '#333' },
  splitInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 8, width: 80, textAlign: 'center', fontSize: 14
  },
  payerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8
  },
  payerName: { fontSize: 15, color: '#333' },
  payerInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 8, width: 100, textAlign: 'center', fontSize: 14
  },
  btn: {
    backgroundColor: '#1DB954', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 40
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
