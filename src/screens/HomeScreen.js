import { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, getUserData, getAttendanceForUser } from '../services/storageService';
import { format } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [todayStatus, setTodayStatus] = useState('No check-in yet');

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      const userDoc = await getUserData(currentUser.uid);
      setUserData(userDoc || currentUser);
      const attendanceRecords = await getAttendanceForUser(currentUser.uid);
      const todayKey = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = attendanceRecords.find((record) => record.date === todayKey);
      if (todayRecord) {
        setTodayStatus(todayRecord.status === 'completed' ? 'Workout completed' : 'Missed today');
      }
    };
    loadData();
  }, []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.greeting}>Good day, {userData?.displayName || 'Athlete'}</Text>
          <Text style={styles.subText}>Keep your streak alive today.</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakCard}>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakValue}>{userData?.currentStreak ?? 0} 🔥</Text>
            </View>
            <View style={styles.streakCard}> 
              <Text style={styles.streakLabel}>Longest</Text>
              <Text style={styles.streakValue}>{userData?.longestStreak ?? 0}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.checkinButton} onPress={() => navigation.navigate('CheckIn')}>
          <Text style={styles.checkinText}>{todayStatus}</Text>
        </TouchableOpacity>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.statText}>Status: {todayStatus}</Text>
          <Text style={styles.statText}>Total workouts: {userData?.totalWorkouts ?? 0}</Text>
          <Text style={styles.statText}>Last active: {userData?.lastActiveDate ? new Date(userData.lastActiveDate).toLocaleDateString() : 'None'}</Text>
        </View>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Groups')}>
          <Text style={styles.actionTitle}>Group streaks</Text>
          <Text style={styles.actionSubtitle}>See your crew’s leaderboard and motivation feed.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.actionTitle}>Profile & history</Text>
          <Text style={styles.actionSubtitle}>Review your progress, attendance, and private metrics.</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909'
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1
  },
  headerCard: {
    backgroundColor: '#121212',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20
  },
  greeting: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8
  },
  subText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 20
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  streakCard: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 22,
    padding: 18,
    marginRight: 10
  },
  streakLabel: {
    color: '#999',
    marginBottom: 6
  },
  streakValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800'
  },
  checkinButton: {
    marginBottom: 20,
    backgroundColor: '#ff8c00',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center'
  },
  checkinText: {
    color: '#090909',
    fontSize: 18,
    fontWeight: '700'
  },
  statsCard: {
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20
  },
  sectionTitle: {
    color: '#ff8c00',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.6
  },
  statText: {
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 22
  },
  actionCard: {
    backgroundColor: '#11131a',
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252836',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 }
  },
  actionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  actionSubtitle: {
    color: '#aaa'
  }
});
