import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.brand}>Fitness Streak</Text>
      <Text style={styles.subtitle}>Build consistency with streaks, photos, and groups.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.outlineText}>Create Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  brand: {
    color: '#ff8c00',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 12
  },
  subtitle: {
    color: '#d0d0d0',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40
  },
  button: {
    width: '100%',
    backgroundColor: '#ff8c00',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  buttonText: {
    color: '#090909',
    fontWeight: '700',
    fontSize: 16
  },
  outlineButton: {
    width: '100%',
    borderColor: '#ff8c00',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  outlineText: {
    color: '#ff8c00',
    fontWeight: '700',
    fontSize: 16
  }
});
