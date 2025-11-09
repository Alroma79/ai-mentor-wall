'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

type Post = {
  id: string;
  title: string;
  body: string;
  tags: string[] | null;
  author: string;
  created_at: string;
};

export default function WallRealtime({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    const ch = supabase
      .channel('realtime:public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as Post;
          setPosts((prev) => [row, ...prev]);
        }
      )
      .subscribe((status) => {
        console.log('[realtime] status:', status);
      });

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <article key={p.id} className="rounded-xl border p-3">
          <h3 className="font-semibold">{p.title}</h3>
          <p className="text-sm opacity-80 whitespace-pre-wrap">{p.body}</p>
        </article>
      ))}
    </div>
  );
}
