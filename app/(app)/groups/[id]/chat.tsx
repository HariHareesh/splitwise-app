import { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import api from '../../../../stores/api';
import { ENDPOINTS, WS_BASE_URL } from '../../../../constants/api';
import { useAuthStore } from '../../../../stores/authStore';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMessages();
    connectWS();
    return () => wsRef.current?.close();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

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
    };
    wsRef.current = ws;
  };

  const sendMessage = async () => {
    if (!input.trim() || !wsRef.current || sending) return;
    setSending(true);
    try {
      wsRef.current.send(JSON.stringify({ content: input.trim() }));
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    } catch {
      return '';
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          <View style={styles.headerTitle}>
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.title}>Group Chat</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMe = item.sender.id === user?.id;
          return (
            <View style={[styles.messageBubbleContainer, isMe && styles.myBubbleContainer]}>
              {!isMe && (
                <View style={styles.avatarContainer}>
                  <View style={styles.senderAvatar}>
                    <Text style={styles.senderAvatarText}>
                      {(item.sender.full_name || item.sender.username)[0].toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}
              <View style={isMe && styles.myBubbleSpacing}>
                {!isMe && (
                  <Text style={styles.senderName}>{item.sender.full_name || item.sender.username}</Text>
                )}
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.msgText, isMe && styles.myMsgText]}>{item.content}</Text>
                  {item.created_at && (
                    <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
                      {formatTime(item.created_at)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#bbb"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{input.length}/500</Text>
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() || sending && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || sending}
        >
          <Ionicons name={sending ? "hourglass" : "send"} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  list: { paddingHorizontal: 12, paddingVertical: 12 },
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  myBubbleContainer: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderAvatarText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  myBubbleSpacing: {
    maxWidth: '75%',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#1DB954',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  msgText: { fontSize: 15, color: '#333', lineHeight: 20 },
  myMsgText: { color: '#fff' },
  timestamp: { fontSize: 11, color: '#999', marginTop: 4 },
  myTimestamp: { color: '#ffffff80' },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 0,
  },
  charCount: {
    fontSize: 10,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 2,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
