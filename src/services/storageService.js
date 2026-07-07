import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system/legacy';

async function ensureUserProfile(user) {
  if (!user) return null;

  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  if (!data) {
    const profile = {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.displayName || user.email?.split('@')[0] || 'Fitness Fan',
      current_streak: 0,
      longest_streak: 0,
      total_workouts: 0,
      last_active_date: null,
      photo_url: user.user_metadata?.photoURL || null
    };
    const { data: inserted, error: insertError } = await supabase.from('users').insert(profile).single();
    if (insertError) throw insertError;
    return inserted;
  }
  if (error) throw error;
  return data;
}

export function onAuthState(callback) {
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  supabase.auth.getSession().then(({ data }) => callback(data.session?.user ?? null));

  return () => {
    authListener.subscription.unsubscribe();
  };
}

export async function signUpWithFallback(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { displayName }
    }
  });
  if (error) throw error;
  const user = data.user || data.session?.user || null;
  if (user) {
    await ensureUserProfile(user);
  }
  return user;
}

export async function signInWithFallback(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  if (data.user) {
    await ensureUserProfile(data.user);
  }
  return data.user;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function getUserData(userId) {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error && error.details?.includes('Result contains no rows')) {
    return null;
  }
  if (error) throw error;
  return data;
}

export async function updateUserDoc(userId, data) {
  const { data: updated, error } = await supabase.from('users').update(data).eq('id', userId).single();
  if (error) throw error;
  return updated;
}

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

export async function createAttendanceRecord(userId, dateKey, status, photoUrl, type) {
  const payload = {
    user_id: userId,
    date: dateKey,
    status,
    photo_url: photoUrl || null,
    type: type || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('attendance').insert(payload).single();
  if (error) throw error;
  return data;
}

export async function getAttendanceForUser(userId) {
  const { data, error } = await supabase.from('attendance').select('*').eq('user_id', userId).order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadPhoto(fileUri, fileName) {
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error('Selected photo file not found');
  }

  const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64
  });
  const fileExt = fileName.split('.').pop();
  const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

  const { data, error } = await supabase.storage.from('workout-photos').upload(fileName, fileBase64, {
    cacheControl: '3600',
    upsert: true,
    contentType: mimeType,
    uploadType: 'base64'
  });

  if (error) throw error;

  const { publicUrl, error: urlError } = supabase.storage.from('workout-photos').getPublicUrl(data.path);
  if (urlError) throw urlError;
  return publicUrl;
}

export async function getGroups() {
  const { data, error } = await supabase.from('groups').select('*');
  if (error) throw error;
  return data;
}

export async function createGroup(groupData) {
  const { data, error } = await supabase.from('groups').insert([{ ...groupData, created_at: new Date().toISOString() }]).single();
  if (error) throw error;
  return data;
}
