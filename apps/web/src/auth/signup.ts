import { supabase } from "../lib/supabase";

export async function signUp(email: string, password: string, display_name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name
      },
    },
  });
  return { data, error };
}
