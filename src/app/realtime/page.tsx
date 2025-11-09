import { createClient } from '@supabase/supabase-js';
import WallRealtime from '@/components/WallRealtime';

export const revalidate = 0;

export default async function Page() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Initial posts fetch failed:', error.message);
  }

  return <WallRealtime initialPosts={posts ?? []} />;
}
