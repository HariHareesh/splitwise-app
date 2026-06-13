import { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import api from '../../../../stores/api';
import { ENDPOINTS, WS_BASE_URL } from '../../../../constants/api';
import { useAuthStore } from '../../../../stores/authStore';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    connectWS();
    return () => wsRef.current?.close();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get(ENDPOINTS.GROUP_MESSAGES(Number(id)));
      setMessages(res.data);
    } catch {}
  };

  const connectWS = async () => {
    const token = await SecureStore.getItemAsync('access_token');
    const ws = new WebSocket(`${WS_BASE_URL}/group/${id}/?token=${token}`);
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
        <Text style={styles.title}>Group Chat</Text>
        <View style={{ width: 24 }} />
      </View>

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
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    backgroundColor: '#1DB954', padding: 24, paddingTop: 60,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  list: { padding: 16 },
  bubble: {
    maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8,
  },
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
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center'
  },
});
