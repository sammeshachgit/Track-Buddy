import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_USER_KEY = '@fitness_streak_current_user';
const USERS_KEY = '@fitness_streak_users';
const ATTENDANCE_KEY = '@fitness_streak_attendance';
const GROUPS_KEY = '@fitness_streak_groups';

let currentUser = null;
const authListeners = [];
let initialized = false;

async function loadCurrentUser() {
  if (!initialized) {
    initialized = true;
    try {
      const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      currentUser = null;
    }
  }
  return currentUser;
}

function notifyAuthState() {
  authListeners.forEach((callback) => callback(currentUser));
}

async function getJson(key, defaultValue) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function onAuthState(callback) {
  authListeners.push(callback);
  loadCurrentUser().then(() => callback(currentUser));
  return () => {
    const index = authListeners.indexOf(callback);
    if (index !== -1) authListeners.splice(index, 1);
  };
}

export async function getCurrentUser() {
  await loadCurrentUser();
  return currentUser;
}

async function saveCurrentUser() {
  if (currentUser) {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  } else {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }
}

async function getUsers() {
  return getJson(USERS_KEY, []);
}

async function saveUsers(users) {
  return setJson(USERS_KEY, users);
}

async function getAttendance() {
  return getJson(ATTENDANCE_KEY, []);
}

async function saveAttendance(attendance) {
  return setJson(ATTENDANCE_KEY, attendance);
}

async function getGroupsData() {
  return getJson(GROUPS_KEY, []);
}

async function saveGroups(groups) {
  return setJson(GROUPS_KEY, groups);
}

async function createLocalUser(email, displayName) {
  const users = await getUsers();
  let user = users.find((item) => item.email === email);
  if (!user) {
    user = {
      uid: `user-${Date.now()}`,
      email,
      displayName: displayName || 'Fitness Fan',
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      totalWorkouts: 0,
      photoURL: null
    };
    users.push(user);
    await saveUsers(users);
    console.log('Created local user record:', user.uid);
  }
  currentUser = user;
  await saveCurrentUser();
  notifyAuthState();
  return user;
}

export async function signUpWithFallback(email, password, displayName) {
  return createLocalUser(email, displayName);
}

export async function signInWithFallback(email, password) {
  const users = await getUsers();
  const user = users.find((item) => item.email === email);
  if (user) {
    currentUser = user;
    await saveCurrentUser();
    notifyAuthState();
    return user;
  }
  return createLocalUser(email, 'Fitness Fan');
}

export async function signOutUser() {
  currentUser = null;
  await saveCurrentUser();
  notifyAuthState();
}

export async function uploadPhoto(fileUri, fileName) {
  return fileUri;
}

export async function getUserData(userId) {
  const users = await getUsers();
  return users.find((item) => item.uid === userId) || null;
}

export async function updateUserDoc(userId, data) {
  const users = await getUsers();
  const index = users.findIndex((item) => item.uid === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data };
  await saveUsers(users);
  if (currentUser?.uid === userId) {
    currentUser = users[index];
    await saveCurrentUser();
    notifyAuthState();
  }
  return users[index];
}

export async function getGroups() {
  return getGroupsData();
}

export async function getAllUsers() {
  return getUsers();
}

export async function createGroup(groupData) {
  const groups = await getGroupsData();
  const newGroup = {
    id: `group-${Date.now()}`,
    ...groupData,
    members: groupData.members || [],
    createdAt: new Date().toISOString()
  };
  groups.push(newGroup);
  await saveGroups(groups);
  return newGroup;
}

export async function createAttendanceRecord(userId, dateKey, status, photoUrl, type) {
  const attendance = await getAttendance();
  const record = {
    id: `attendance-${userId}-${dateKey}`,
    userId,
    date: dateKey,
    status,
    photoUrl: photoUrl || null,
    type: type || null,
    updatedAt: new Date().toISOString()
  };
  const existingIndex = attendance.findIndex((item) => item.id === record.id);
  if (existingIndex !== -1) {
    attendance[existingIndex] = record;
  } else {
    attendance.push(record);
  }
  await saveAttendance(attendance);
  return record;
}

export async function getAttendanceForUser(userId) {
  const attendance = await getAttendance();
  return attendance.filter((item) => item.userId === userId).sort((a, b) => (a.date < b.date ? 1 : -1));
}
