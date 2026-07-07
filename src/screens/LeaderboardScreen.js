import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllUsers } from '../services/storageService';
import { StatusBar } from 'expo-status-bar';
import { format } from 'date-fns';

export default function LeaderboardScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const list = await getAllUsers();
      const sorted = [...list].sort((a, b) => {
        const streakA = a.currentStreak || 0;
        const streakB = b.currentStreak || 0;
        if (streakB !== streakA) {
          return streakB - streakA;
        }
        return (b.totalWorkouts || 0) - (a.totalWorkouts || 0);
      });
      setUsers(sorted);
    };
    loadLeaderboard();
  }, []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Streak leaderboard</Text>
      <Text style={styles.subtitle}>Ranked by current streak, then total workouts.</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid || item.id}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.rankCircle}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.name}>{item.display_name || 'Anonymous'}</Text>
              <Text style={styles.details}>
                Last active: {item.lastActiveDate ? format(new Date(item.lastActiveDate), 'MMM d') : 'N/A'}
              </Text>
            </View>
            <View style={styles.streakTag}>
              <Text style={styles.streakText}>{item.currentStreak || 0}d</Text>
              <Text style={styles.streakLabel}>streak</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No leaderboard data yet. Invite your crew and start checking in.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
    paddingHorizontal: 20,
    paddingTop: 20
  },
  title: {
    color: '#ff8c00',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6
  },
  subtitle: {
    color: '#aaa',
    marginBottom: 18
  },
  card: {
    backgroundColor: '#121212',
    padding: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  rankCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  rankText: {
    color: '#fff',
    fontWeight: '700'
  },
  userMeta: {
    flex: 1
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  details: {
    color: '#999',
    marginTop: 4
  },
  streakTag: {
    alignItems: 'flex-end'
  },
  streakText: {
    color: '#ffb86c',
    fontSize: 18,
    fontWeight: '800'
  },
  streakLabel: {
    color: '#999',
    fontSize: 12
  },
  empty: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 28
  }
});
