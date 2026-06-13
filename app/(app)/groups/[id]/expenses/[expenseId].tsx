import { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import api from '../../../../../stores/api';
import { ENDPOINTS, WS_BASE_URL } from '../../../../../constants/api';
import { useAuthStore } from '../../../../../stores/authStore';

export default function ExpenseDetailScreen() {
  const { id, expenseId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [expense, setExpense] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'detail' | 'chat'>('detail');
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchExpense();
    fetchMessages();
    connectWS();
    return () => wsRef.current?.close();
  }, []);

  const fetchExpense = async () => {
    try {
      const res = await api.get(ENDPOINTS.EXPENSE_DETAIL(Number(expenseId)));
      setExpense(res.data);
    } catch {}
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(ENDPOINTS.EXPENSE_MESSAGES(Number(expenseId)));
      setMessages(res.data);
    } catch {}
  };

  const connectWS = async () => {
    const token = await SecureStore.getItemAsync('access_token');
    const ws = new WebSocket(`${WS_BASE_URL}/expense/${expenseId}/?token=${token}`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };
    wsRef.current = ws;
  };

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ content: input.trim() }));
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{expense?.title || 'Expense'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'detail' && styles.activeTab]} onPress={() => setTab('detail')}>
          <Text style={[styles.tabText, tab === 'detail' && styles.activeTabText]}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'chat' && styles.activeTab]} onPress={() => setTab('chat')}>
          <Text style={[styles.tabText, tab === 'chat' && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>
      </View>

      {tab === 'detail' ? (
        <ScrollView style={styles.detailScroll}>
          {expense && (
            <View style={styles.detailCard}>
              <Text style={styles.amount}>₹{expense.total_amount}</Text>
              <Text style={styles.splitType}>{expense.split_type} split</Text>

              <Text style={styles.sectionTitle}>Paid by</Text>
              {expense.payers?.map((p: any) => (
                <View key={p.id} style={styles.row}>
                  <Text style={styles.rowName}>{p.user.full_name || p.user.username}</Text>
                  <Text style={styles.rowAmount}>₹{p.amount_paid}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Split among</Text>
              {expense.splits?.map((s: any) => (
                <View key={s.id} style={styles.row}>
                  <Text style={styles.rowName}>{s.user.full_name || s.user.username}</Text>
                  <Text style={styles.rowAmount}>₹{s.owed_amount}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isMe = item.sender.id === user?.id;
              return (
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  {!isMe && <Text style={styles.senderName}>{item.sender.username}</Text>}
                  <Text style={[styles.msgText, isMe && styles.myMsgText]}>{item.content}</Text>
                </View>
              );
            }}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
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
  detailScroll: { padding: 16 },
  detailCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  amount: { fontSize: 32, fontWeight: 'bold', color: '#1DB954', textAlign: 'center' },
  splitType: { textAlign: 'center', color: '#999', marginTop: 4, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rowName: { fontSize: 14, color: '#333' },
  rowAmount: { fontSize: 14, fontWeight: '600', color: '#333' },
  list: { padding: 16 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myBubble: { backgroundColor: '#1DB954', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  senderName: { fontSize: 11, color: '#999', marginBottom: 4 },
  msgText: { fontSize: 15, color: '#333' },
  myMsgText: { color: '#fff' },
  inputRow: {
    flexDirection: 'row', padding: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'flex-end', gap: 8
  },
  input: {
    flex: 1, backgroundColor: '#f8f8f8', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center'
  },
});
