import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGroups, createGroup } from '../services/storageService';
import { StatusBar } from 'expo-status-bar';

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      const list = await getGroups();
      setGroups(list);
    };
    loadGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Group name required', 'Please enter a squad name.');
      return;
    }
    setCreating(true);
    try {
      await createGroup({ name: name.trim(), description: description.trim(), members: [] });
      setName('');
      setDescription('');
      const list = await getGroups();
      setGroups(list);
      Alert.alert('Group created', 'Your new squad is ready.');
    } catch (error) {
      Alert.alert('Create failed', error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Your squads</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No groups yet. Start a new squad to keep everyone motivated.</Text>}
        contentContainerStyle={{ paddingBottom: 36 }}
        renderItem={({ item }) => (
          <View style={styles.groupCard}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupMeta}>{item.description}</Text>
            <Text style={styles.groupInfo}>{item.members?.length ?? 0} members · Streak-based</Text>
          </View>
        )}
      />
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Create a new squad</Text>
        <TextInput
          style={styles.input}
          placeholder="Squad name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description"
          placeholderTextColor="#777"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup} disabled={creating}>
          <Text style={styles.createText}>{creating ? 'Creating…' : 'Create squad'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090909',
    padding: 20
  },
  title: {
    color: '#ff8c00',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16
  },
  groupCard: {
    backgroundColor: '#121212',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14
  },
  groupName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  groupMeta: {
    color: '#ccc',
    marginTop: 8
  },
  groupInfo: {
    color: '#999',
    marginTop: 10,
    fontSize: 13
  },
  empty: {
    color: '#aaa',
    marginVertical: 24,
    textAlign: 'center'
  },
  createButton: {
    marginTop: 12,
    backgroundColor: '#ff8c00',
    borderRadius: 20,
    alignItems: 'center',
    padding: 16
  },
  createText: {
    color: '#090909',
    fontWeight: '700'
  }
});
