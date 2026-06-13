import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../stores/api';
import { ENDPOINTS } from '../../../constants/api';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'expenses' | 'balances'>('expenses');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        api.get(ENDPOINTS.GROUP_DETAIL(Number(id))),
        api.get(ENDPOINTS.EXPENSES(Number(id))),
        api.get(ENDPOINTS.GROUP_BALANCES(Number(id))),
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{group?.name || 'Group'}</Text>
        <TouchableOpacity onPress={() => router.push(`/(app)/groups/${id}/members`)}>
          <Ionicons name="people-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'expenses' && styles.activeTab]} onPress={() => setTab('expenses')}>
          <Text style={[styles.tabText, tab === 'expenses' && styles.activeTabText]}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'balances' && styles.activeTab]} onPress={() => setTab('balances')}>
          <Text style={[styles.tabText, tab === 'balances' && styles.activeTabText]}>Balances</Text>
        </TouchableOpacity>
      </View>

      {tab === 'expenses' ? (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No expenses yet!</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/groups/${id}/expenses/${item.id}`)}>
              <View style={styles.expenseIcon}>
                <Ionicons name="receipt-outline" size={20} color="#1DB954" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>₹{item.total_amount} • {item.split_type}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={balances?.suggested_settlements || []}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              {balances?.balances?.map((b: any) => (
                <View key={b.user.id} style={styles.balanceCard}>
                  <Text style={styles.balanceName}>{b.user.full_name || b.user.username}</Text>
                  <Text style={[styles.balanceNet, { color: b.net >= 0 ? '#1DB954' : '#ff4444' }]}>
                    {b.net >= 0 ? `gets back ₹${b.net}` : `owes ₹${Math.abs(b.net)}`}
                  </Text>
                </View>
              ))}
              <Text style={styles.sectionTitle}>Suggested Settlements</Text>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>All settled up! 🎉</Text>}
          renderItem={({ item }) => (
            <View style={styles.settlementCard}>
              <Text style={styles.settlementText}>
                <Text style={styles.bold}>{item.from.full_name || item.from.username}</Text>
                {' pays '}
                <Text style={styles.bold}>{item.to.full_name || item.to.username}</Text>
                {' '}
                <Text style={styles.amount}>₹{item.amount}</Text>
              </Text>
              <TouchableOpacity style={styles.settleBtn} onPress={() => router.push(`/(app)/groups/${id}/settle`)}>
                <Text style={styles.settleBtnText}>Settle</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push(`/(app)/groups/${id}/expenses/create`)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    backgroundColor: '#1DB954', padding: 24, paddingTop: 60,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#1DB954' },
  tabText: { fontSize: 14, color: '#999' },
  activeTabText: { color: '#1DB954', fontWeight: '600' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  expenseIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f0fff4', justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardSub: { fontSize: 13, color: '#999', marginTop: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 16 },
  balanceCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  balanceName: { fontSize: 15, fontWeight: '500', color: '#333' },
  balanceNet: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
  settlementCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  settlementText: { fontSize: 14, color: '#333', flex: 1 },
  bold: { fontWeight: 'bold' },
  amount: { color: '#1DB954', fontWeight: 'bold' },
  settleBtn: { backgroundColor: '#1DB954', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  settleBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
});
