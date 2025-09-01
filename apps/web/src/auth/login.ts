import { supabase } from '../lib/supabase';

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Login error:", error.message);
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}
export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
  } else {
    // Optional: clear any local state, redirect, or show message
    console.log("User logged out");
    // Example: window.location.href = "/login";
  }
};