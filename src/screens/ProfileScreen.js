import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, getUserData, getAttendanceForUser, signOutUser } from '../services/storageService';
import { StatusBar } from 'expo-status-bar';
import { startOfMonth, endOfMonth, startOfWeek, addDays, format, isSameDay, isSameMonth } from 'date-fns';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      const userDoc = await getUserData(currentUser.id);
      setUserData(userDoc || currentUser);
      const attendanceRecords = await getAttendanceForUser(currentUser.id);
      const attendance = {};
      attendanceRecords.forEach((record) => {
        if (record.status === 'completed') {
          attendance[record.date] = true;
        }
      });
      setAttendanceMap(attendance);
      generateCalendar();
    };
    loadProfile();
  }, []);

  const generateCalendar = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 42; i += 1) {
      days.push(addDays(calendarStart, i));
    }
    setCalendarDays(days);
  };

  const completedDays = Object.keys(attendanceMap).length;
  const today = new Date();
  const monthLabel = format(today, 'MMMM yyyy');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.name}>{userData?.display_name || 'Fitness Friend'}</Text>
        <Text style={styles.handle}>{userData?.email || 'No email'}</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statLabel}>Current streak</Text>
        <Text style={styles.statValue}>{userData?.currentStreak ?? 0} days</Text>
        <Text style={styles.statLabel}>Longest streak</Text>
        <Text style={styles.statValue}>{userData?.longestStreak ?? 0} days</Text>
        <Text style={styles.statLabel}>Workout days</Text>
        <Text style={styles.statValue}>{userData?.totalWorkouts ?? 0}</Text>
      </View>
      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>{monthLabel}</Text>
        <Text style={styles.calendarSubtitle}>{completedDays} workout days this month</Text>
        <FlatList
          data={calendarDays}
          keyExtractor={(item) => format(item, 'yyyy-MM-dd')}
          numColumns={7}
          contentContainerStyle={styles.calendarList}
          renderItem={({ item }) => {
            const formatted = format(item, 'yyyy-MM-dd');
            const isToday = isSameDay(item, today);
            const isCurrentMonth = isSameMonth(item, today);
            const completed = attendanceMap[formatted];
            return (
              <View style={[
                styles.dayBox,
                !isCurrentMonth && styles.dayBoxMuted,
                completed && styles.dayBoxCompleted,
                isToday && styles.dayBoxToday
              ]}>
                <Text style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextMuted,
                  completed && styles.dayTextCompleted,
                  isToday && styles.dayTextToday
                ]}>
                  {format(item, 'd')}
                </Text>
              </View>
            );
          }}
        />
      </View>
      <View style={styles.privateCard}>
        <Text style={styles.privateTitle}>Private metrics</Text>
        <Text style={styles.privateText}>Calories, plans, and advanced stats are kept private in Phase 1.</Text>
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
        <Text style={styles.signOutText}>Sign Out</Text>
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
  calendarList: {
    paddingBottom: 28
  },
  header: {
    marginBottom: 24
  },
  name: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800'
  },
  handle: {
    color: '#aaa',
    marginTop: 6
  },
  statsCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 24,
    marginBottom: 18
  },
  statLabel: {
    color: '#999',
    marginTop: 16,
    fontSize: 14
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700'
  },
  calendarCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20
  },
  calendarTitle: {
    color: '#ff8c00',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6
  },
  calendarSubtitle: {
    color: '#ccc',
    marginBottom: 16
  },
  dayBox: {
    width: 38,
    height: 38,
    margin: 4,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dayBoxMuted: {
    backgroundColor: '#101010'
  },
  dayBoxCompleted: {
    backgroundColor: '#254e20'
  },
  dayBoxToday: {
    borderColor: '#ff8c00',
    borderWidth: 1
  },
  dayText: {
    color: '#fff',
    fontSize: 14
  },
  dayTextMuted: {
    color: '#444'
  },
  dayTextCompleted: {
    color: '#b3ffb8'
  },
  dayTextToday: {
    color: '#ffb86c'
  },
  privateCard: {
    backgroundColor: '#171717',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20
  },
  privateTitle: {
    color: '#ff8c00',
    fontWeight: '700',
    marginBottom: 10
  },
  privateText: {
    color: '#ccc'
  },
  signOutButton: {
    backgroundColor: '#ff8c00',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center'
  },
  signOutText: {
    color: '#090909',
    fontWeight: '700'
  }
});
