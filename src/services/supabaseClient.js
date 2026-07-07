import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qsousaokohtttafnciis.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4hSQ4Z--e5Tz0cJiwCwlzQ_LbRwPxGe';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Replace the placeholders above with your Supabase project URL and anon key.
