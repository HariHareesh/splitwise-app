import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../../stores/api';
import { ENDPOINTS } from '../../../../constants/api';

export default function SettleScreen() {
  const { id } = useLocalSearchParams();
  const [payeeId, setPayeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'manual' | 'online'>('manual');
  const [loading, setLoading] = useState(false);

  const handleSettle = async () => {
    if (!payeeId || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post(ENDPOINTS.SETTLEMENTS(Number(id)), {
        payer_id: null,
        payee_id: Number(payeeId),
        amount: Number(amount),
        method,
      });
      Alert.alert('Success', 'Settlement recorded!');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to record settlement');
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
        <Text style={styles.title}>Settle Up</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Payee User ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter user ID"
          placeholderTextColor="#999"
          value={payeeId}
          onChangeText={setPayeeId}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#999"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'manual' && styles.methodActive]}
            onPress={() => setMethod('manual')}
          >
            <Text style={[styles.methodText, method === 'manual' && styles.methodTextActive]}>Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'online' && styles.methodActive]}
            onPress={() => setMethod('online')}
          >
            <Text style={[styles.methodText, method === 'online' && styles.methodTextActive]}>Online</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSettle} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Recording...' : 'Record Settlement'}</Text>
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
  methodRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  methodBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff'
  },
  methodActive: { borderColor: '#1DB954', backgroundColor: '#f0fff4' },
  methodText: { fontSize: 15, color: '#666' },
  methodTextActive: { color: '#1DB954', fontWeight: '600' },
  btn: {
    backgroundColor: '#1DB954', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
