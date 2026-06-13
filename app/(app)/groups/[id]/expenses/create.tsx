import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../../../stores/api';
import { ENDPOINTS } from '../../../../../constants/api';

export default function CreateExpenseScreen() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'unequal' | 'itemwise' | 'manual'>('equal');
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
      if (res.data.length > 0) {
        setSelectedMembers(res.data.map((m: any) => m.user.id));
      }
    } catch {}
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!title || !amount || selectedMembers.length === 0) {
      Alert.alert('Error', 'Please fill all fields and select members');
      return;
    }

    const payersData = Object.entries(payers)
      .filter(([uid]) => selectedMembers.includes(Number(uid)))
      .map(([uid, amt]) => ({ user_id: Number(uid), amount_paid: Number(amt) || 0 }));

    if (payersData.length === 0 || payersData.every(p => p.amount_paid === 0)) {
      Alert.alert('Error', 'Add at least one payer with amount');
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
          <Text style={styles.title}>New Expense</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#1DB954" />
            <Text style={styles.sectionTitle}>Expense Details</Text>
          </View>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dinner at restaurant"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Total Amount (₹) *</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#bbb"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Split Type Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-network" size={20} color="#1DB954" />
            <Text style={styles.sectionTitle}>Split Type</Text>
          </View>

          <View style={styles.chipRow}>
            {[
              { id: 'equal', label: 'Equal', icon: 'scale' },
              { id: 'unequal', label: 'Unequal', icon: 'swap-vertical' },
              { id: 'itemwise', label: 'Itemwise', icon: 'list' },
              { id: 'manual', label: 'Manual', icon: 'create' }
            ].map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.chip,
                  splitType === type.id && styles.chipActive
                ]}
                onPress={() => setSplitType(type.id as any)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={16}
                  color={splitType === type.id ? '#fff' : '#1DB954'}
                />
                <Text style={[styles.chipText, splitType === type.id && styles.chipTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color="#1DB954" />
            <Text style={styles.sectionTitle}>Select Members</Text>
          </View>

          <View style={styles.memberList}>
            {members.map(m => (
              <TouchableOpacity
                key={m.user.id}
                style={[
                  styles.memberChip,
                  selectedMembers.includes(m.user.id) && styles.memberChipActive
                ]}
                onPress={() => toggleMember(m.user.id)}
              >
                <Ionicons
                  name={selectedMembers.includes(m.user.id) ? 'checkmark-circle' : 'add-circle-outline'}
                  size={18}
                  color={selectedMembers.includes(m.user.id) ? '#fff' : '#1DB954'}
                />
                <Text style={[styles.memberChipText, selectedMembers.includes(m.user.id) && styles.memberChipTextActive]}>
                  {m.user.full_name || m.user.username}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Split Details Section */}
        {splitType !== 'equal' && selectedMembers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calculator" size={20} color="#1DB954" />
              <Text style={styles.sectionTitle}>Split Amounts</Text>
            </View>

            {members
              .filter(m => selectedMembers.includes(m.user.id))
              .map(m => (
                <View key={m.user.id} style={styles.inputRow}>
                  <Text style={styles.inputLabel}>{m.user.full_name || m.user.username}</Text>
                  <TextInput
                    style={styles.splitInput}
                    placeholder={splitType === 'itemwise' ? '% ' : splitType === 'unequal' ? '₹' : 'amount'}
                    placeholderTextColor="#bbb"
                    keyboardType="decimal-pad"
                    value={splits[m.user.id] || ''}
                    onChangeText={(v) => setSplits(prev => ({ ...prev, [m.user.id]: v }))}
                  />
                </View>
              ))}
          </View>
        )}

        {/* Payers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet" size={20} color="#1DB954" />
            <Text style={styles.sectionTitle}>Who Paid?</Text>
          </View>

          {members
            .filter(m => selectedMembers.includes(m.user.id))
            .map(m => (
              <View key={m.user.id} style={styles.inputRow}>
                <Text style={styles.inputLabel}>{m.user.full_name || m.user.username}</Text>
                <View style={styles.payerInputWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.payerInput}
                    placeholder="0.00"
                    placeholderTextColor="#bbb"
                    keyboardType="decimal-pad"
                    value={payers[m.user.id] || ''}
                    onChangeText={(v) => setPayers(prev => ({ ...prev, [m.user.id]: v }))}
                  />
                </View>
              </View>
            ))}
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Expense'}</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  form: { paddingHorizontal: 16, paddingTop: 16 },
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    paddingLeft: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DB954',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1DB954',
    backgroundColor: '#fff',
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#1DB954',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#1DB954' },
  chipTextActive: { color: '#fff' },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1DB954',
    backgroundColor: '#fff',
    gap: 6,
  },
  memberChipActive: {
    backgroundColor: '#1DB954',
  },
  memberChipText: { fontSize: 13, fontWeight: '600', color: '#1DB954' },
  memberChipTextActive: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#333', flex: 1 },
  splitInput: {
    width: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  payerInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingLeft: 8,
    width: 110,
  },
  payerInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
  },
  btn: {
    backgroundColor: '#1DB954',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
