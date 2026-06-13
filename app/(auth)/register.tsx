import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setTokens } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password || !password2) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== password2) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register/`, {
        email, username, full_name: fullName, password, password2
      });
      await setTokens(res.data.tokens.access, res.data.tokens.refresh);
      setUser(res.data.user);
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      const errors = err.response?.data;
      const msg = errors ? Object.values(errors).flat().join('\n') : 'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>💸 SplitWise</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#1DB954" />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#bbb"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="at" size={20} color="#1DB954" />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#bbb"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#1DB954" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#1DB954" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#1DB954" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#1DB954" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#bbb"
              value={password2}
              onChangeText={setPassword2}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={8}>
              <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#1DB954" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Register'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 32, color: '#333' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  btn: {
    backgroundColor: '#1DB954',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  link: { textAlign: 'center', color: '#666', fontSize: 14 },
  linkBold: { color: '#1DB954', fontWeight: 'bold' },
});
