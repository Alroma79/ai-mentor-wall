'use client';

import { createClient } from '@supabase/supabase-js';

// Public browser client (anon key via NEXT_PUBLIC_* envs)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { realtime: { params: { eventsPerSecond: 10 } } }
);

// Keep the Realtime socket authenticated after login/logout
supabase.auth.onAuthStateChange((_event, session) => {
  const realtime = supabase.realtime as unknown as {
    setAuth: (token: string) => void;
  };
  realtime.setAuth(session?.access_token ?? '');
});
