import {supabase} from "../lib/supabase";
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  console.log("Current session:", session);
});
