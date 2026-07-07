import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAttendanceForUser, getCurrentUser } from '../services/storageService';
import { format } from 'date-fns';
import { StatusBar } from 'expo-status-bar';

export default function FeedScreen() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadFeed = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      const data = await getAttendanceForUser(currentUser.uid);
      setRecords(data);
    };
    loadFeed();
  }, []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Daily motivation</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.photo_url ? <Image source={{ uri: item.photo_url }} style={styles.photo} /> : null}
            <View style={styles.meta}>
              <Text style={styles.status}>{item.status === 'completed' ? 'Completed' : 'Missed'}</Text>
              <Text style={styles.date}>{format(new Date(item.date), 'MMM d, yyyy')}</Text>
              <Text style={styles.type}>{item.type ? `Workout: ${item.type}` : 'Workout recorded'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Check in today to see your motivation feed.</Text>}
        contentContainerStyle={[styles.listContent, { paddingBottom: 40 }]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
    paddingTop: 20,
    paddingHorizontal: 20
  },
  listContent: {
    paddingBottom: 20
  },
  title: {
    color: '#ff8c00',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 22,
    marginBottom: 16,
    overflow: 'hidden'
  },
  photo: {
    width: '100%',
    height: 200
  },
  meta: {
    padding: 16
  },
  status: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  date: {
    color: '#aaa',
    marginTop: 6
  },
  type: {
    color: '#ccc',
    marginTop: 8
  },
  empty: {
    color: '#aaa',
    marginTop: 24,
    textAlign: 'center'
  }
});
