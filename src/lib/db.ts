import { supabase } from "./supabaseClient";
import type { Reply, WallPost } from "./types";

export async function fetchWall(limit = 50) {
  const [postsResult, repliesResult] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("replies")
      .select("*")
      .order("created_at", { ascending: true }),
  ]);

  if (postsResult.error) {
    return { data: null, error: postsResult.error };
  }

  if (repliesResult.error) {
    return { data: null, error: repliesResult.error };
  }

  const repliesByPost = new Map<string, Reply[]>();
  (repliesResult.data ?? []).forEach((reply) => {
    const existing = repliesByPost.get(reply.post_id) ?? [];
    repliesByPost.set(reply.post_id, [...existing, reply as Reply]);
  });

  const wall: WallPost[] =
    postsResult.data?.map((post) => ({
      ...(post as WallPost),
      replies: repliesByPost.get(post.id) ?? [],
    })) ?? [];

  return { data: wall, error: null };
}

export async function createPost(input: {
  title: string;
  body: string;
  tags: string[];
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Sign in to post on the wall.");
  }

  const { error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      body: input.body,
      tags: input.tags,
      author: user.id,
    });

  if (error) {
    throw error;
  }
}

export async function createReply(input: { postId: string; body: string }) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Sign in to reply.");
  }

  const { error } = await supabase
    .from("replies")
    .insert({
      post_id: input.postId,
      body: input.body,
      author: user.id,
      is_ai: false,
    });

  if (error) {
    throw error;
  }
}
