import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { createAttendanceRecord, getCurrentUser, getUserData, updateUserDoc, uploadPhoto } from '../services/storageService';
import { format } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

export default function CheckInScreen() {
  const [workoutType, setWorkoutType] = useState('Gym');
  const [photoUri, setPhotoUri] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll access is required to upload workout photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        allowsEditing: false
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Photo picker failed', error.message || 'Unable to open image library.');
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
        const fileName = `${currentUser.id}_${today}.jpg`;
        photoUrl = await uploadPhoto(photoUri, fileName);
        setUploadedPhotoUrl(photoUrl);
      }
      await createAttendanceRecord(currentUser.id, today, 'completed', photoUrl, workoutType);
      const data = await getUserData(currentUser.id);
      if (data) {
        const lastActive = data.last_active_date ? new Date(data.last_active_date) : null;
        const yesterday = new Date(Date.now() - 86400000);
        const isYesterday = lastActive && format(lastActive, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd');
        const nextStreak = isYesterday ? (data.current_streak || 0) + 1 : 1;
        const longestStreak = Math.max(data.longest_streak || 0, nextStreak);
        await updateUserDoc(currentUser.id, {
          current_streak: nextStreak,
          longest_streak: longestStreak,
          last_active_date: new Date().toISOString(),
          total_workouts: (data.total_workouts || 0) + 1
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
      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        </View>
      ) : null}
      {uploadedPhotoUrl ? (
        <View style={styles.uploadedPreviewContainer}>
          <Text style={styles.uploadedLabel}>Uploaded image</Text>
          <Image source={{ uri: uploadedPhotoUrl }} style={styles.previewImage} />
        </View>
      ) : null}
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
  },
  previewContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333'
  },
  uploadedPreviewContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333'
  },
  previewImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover'
  },
  uploadedLabel: {
    color: '#ff8c00',
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 8
  }
});
