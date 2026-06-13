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

  const splitTypeColor = (type: string) => {
    const colors: any = { itemwise: '#ff9800', equal: '#2196f3', manual: '#9c27b0' };
    return colors[type] || '#666';
  };

  const formatBalance = (balance: number) => {
    return balance >= 0 ? `Gets back ₹${balance}` : `Owes ₹${Math.abs(balance)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{group?.name || 'Group'}</Text>
          <TouchableOpacity onPress={() => router.push(`/(app)/groups/${id}/members`)} hitSlop={8}>
            <Ionicons name="people-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'expenses' && styles.activeTab]}
          onPress={() => setTab('expenses')}
        >
          <Ionicons name="receipt" size={18} color={tab === 'expenses' ? '#1DB954' : '#bbb'} />
          <Text style={[styles.tabText, tab === 'expenses' && styles.activeTabText]}>Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'balances' && styles.activeTab]}
          onPress={() => setTab('balances')}
        >
          <Ionicons name="swap-horizontal" size={18} color={tab === 'balances' ? '#1DB954' : '#bbb'} />
          <Text style={[styles.tabText, tab === 'balances' && styles.activeTabText]}>Balances</Text>
        </TouchableOpacity>
      </View>

      {tab === 'expenses' ? (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#1DB954" colors={['#1DB954']} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#ddd" />
              <Text style={styles.empty}>No expenses yet!</Text>
              <Text style={styles.emptySubText}>Tap the + button to add an expense</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/groups/${id}/expenses/${item.id}`)}>
              <View style={[styles.expenseIcon, { backgroundColor: splitTypeColor(item.split_type) + '15' }]}>
                <Ionicons name="receipt-outline" size={20} color={splitTypeColor(item.split_type)} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardSubRow}>
                  <Text style={styles.cardSub}>₹{item.total_amount}</Text>
                  <View style={[styles.splitBadge, { backgroundColor: splitTypeColor(item.split_type) + '20' }]}>
                    <Text style={[styles.splitBadgeText, { color: splitTypeColor(item.split_type) }]}>{item.split_type}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d0d0d0" />
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
                  <View style={styles.balanceContent}>
                    <View style={[styles.balanceIndicator, { backgroundColor: b.net >= 0 ? '#1DB954' : '#dc3545' }]} />
                    <View style={styles.balanceInfo}>
                      <Text style={styles.balanceName}>{b.user.full_name || b.user.username}</Text>
                      <Text style={[styles.balanceAmount, { color: b.net >= 0 ? '#1DB954' : '#dc3545' }]}>{formatBalance(b.net)}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {balances?.suggested_settlements?.length > 0 && (
                <Text style={styles.sectionTitle}>Suggested Settlements</Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#1DB954" />
              <Text style={styles.empty}>All settled up! 🎉</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.settlementCard}>
              <View style={styles.settlementInfo}>
                <View style={styles.settlementUser}>
                  <Text style={styles.settlementName}>{item.from.full_name || item.from.username}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#1DB954" />
                  <Text style={styles.settlementName}>{item.to.full_name || item.to.username}</Text>
                </View>
                <Text style={styles.settlementAmount}>₹{item.amount}</Text>
              </View>
              <TouchableOpacity style={styles.settleBtn} onPress={() => router.push(`/(app)/groups/${id}/settle`)}>
                <Ionicons name="checkmark" size={16} color="#fff" />
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
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { backgroundColor: '#1DB954', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center', paddingHorizontal: 16 },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#1DB954' },
  tabText: { fontSize: 14, color: '#bbb', fontWeight: '500' },
  activeTabText: { color: '#1DB954', fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingVertical: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  expenseIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardSub: { fontSize: 14, fontWeight: '600', color: '#555' },
  splitBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  splitBadgeText: { fontSize: 11, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  empty: { textAlign: 'center', color: '#333', marginTop: 20, fontSize: 18, fontWeight: '600' },
  emptySubText: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 14 },
  balanceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  balanceContent: { flexDirection: 'row', alignItems: 'center' },
  balanceIndicator: { width: 6, height: 50, borderRadius: 3, marginRight: 12 },
  balanceInfo: { flex: 1 },
  balanceName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  balanceAmount: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 12 },
  settlementCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  settlementInfo: { flex: 1 },
  settlementUser: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  settlementName: { fontSize: 15, fontWeight: '600', color: '#333' },
  settlementAmount: { fontSize: 15, fontWeight: '700', color: '#1DB954' },
  settleBtn: { backgroundColor: '#1DB954', borderRadius: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center', shadowColor: '#1DB954', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
});
