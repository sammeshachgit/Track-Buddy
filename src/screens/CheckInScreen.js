import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { createAttendanceRecord, getCurrentUser, getUserData, updateUserDoc, uploadPhoto } from '../services/storageService';
import { format } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

export default function CheckInScreen() {
  const [workoutType, setWorkoutType] = useState('Gym');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera roll access is required to upload workout photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, quality: 0.7 });
    if (!result.cancelled) {
      setPhotoUri(result.uri);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('No user signed in');
      }
      const today = format(new Date(), 'yyyy-MM-dd');
      let photoUrl = null;
      if (photoUri) {
        const fileName = `${currentUser.uid}_${today}.jpg`;
        photoUrl = await uploadPhoto(photoUri, fileName);
      }
      await createAttendanceRecord(currentUser.uid, today, 'completed', photoUrl, workoutType);
      const data = await getUserData(currentUser.uid);
      if (data) {
        const lastActive = data.lastActiveDate ? new Date(data.lastActiveDate) : null;
        const yesterday = new Date(Date.now() - 86400000);
        const isYesterday = lastActive && format(lastActive, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd');
        const nextStreak = isYesterday ? (data.currentStreak || 0) + 1 : 1;
        const longestStreak = Math.max(data.longestStreak || 0, nextStreak);
        await updateUserDoc(currentUser.uid, {
          currentStreak: nextStreak,
          longestStreak,
          lastActiveDate: new Date().toISOString(),
          totalWorkouts: (data.totalWorkouts || 0) + 1
        });
        Alert.alert('Check-in saved', `Your streak is now ${nextStreak} days.`);
      }
    } catch (error) {
      Alert.alert('Check-in failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.heading}>Daily Check-In</Text>
      <Text style={styles.description}>Mark today as completed and upload a photo to stay accountable.</Text>
      <TextInput
        style={styles.input}
        value={workoutType}
        onChangeText={setWorkoutType}
        placeholder="Workout type (gym, run, yoga...)"
        placeholderTextColor="#777"
      />
      <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
        <Text style={styles.photoButtonText}>{photoUri ? 'Change photo' : 'Add photo'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn} disabled={loading}>
        <Text style={styles.checkInText}>{loading ? 'Saving...' : 'Complete workout'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
    padding: 24
  },
  heading: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10
  },
  description: {
    color: '#ccc',
    marginBottom: 24
  },
  input: {
    backgroundColor: '#121212',
    color: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#222'
  },
  photoButton: {
    backgroundColor: '#171717',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  photoButtonText: {
    color: '#ff8c00',
    fontWeight: '700'
  },
  checkInButton: {
    backgroundColor: '#ff8c00',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center'
  },
  checkInText: {
    color: '#090909',
    fontWeight: '700'
  }
});
