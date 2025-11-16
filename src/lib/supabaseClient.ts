import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Keep the Realtime socket authenticated after login/logout
supabase.auth.onAuthStateChange((_event, session) => {
  const realtime = supabase.realtime as unknown as {
    setAuth: (token: string | null) => void;
  };
  realtime.setAuth(session?.access_token ?? null);
});
