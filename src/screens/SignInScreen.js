import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithFallback } from '../services/storageService';
import { StatusBar } from 'expo-status-bar';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithFallback(email.trim(), password);
    } catch (error) {
      Alert.alert('Sign In Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue your streak.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>Create a new account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
    padding: 24,
    justifyContent: 'center'
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8
  },
  subtitle: {
    color: '#aaa',
    marginBottom: 28,
    fontSize: 16
  },
  input: {
    backgroundColor: '#121212',
    color: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222'
  },
  button: {
    backgroundColor: '#ff8c00',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14
  },
  buttonText: {
    color: '#090909',
    fontWeight: '700'
  },
  linkText: {
    color: '#ff8c00',
    textAlign: 'center'
  }
});
