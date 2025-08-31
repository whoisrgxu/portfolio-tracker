import { supabase } from '../lib/supabase';

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Login error:", error.message);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}