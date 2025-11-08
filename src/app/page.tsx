"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  RealtimePostgresChangesPayload,
  Session,
} from "@supabase/supabase-js";
import AuthPanel from "@/components/auth-panel";
import NewPostForm from "@/components/new-post-form";
import PostThread, { OptimisticReply } from "@/components/post-thread";
import { createPost, createReply, fetchWall } from "@/lib/db";
import { supabase } from "@/lib/supabaseClient";
import type { Reply, WallPost } from "@/lib/types";

type BusyMap = Record<string, boolean>;

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [wall, setWall] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [replyBusy, setReplyBusy] = useState<BusyMap>({});
  const [aiBusy, setAiBusy] = useState<BusyMap>({});
  const [optimisticReplies, setOptimisticReplies] = useState<
    Record<string, OptimisticReply | null>
  >({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadWall = async () => {
      setLoading(true);
      const { data, error } = await fetchWall();
      if (error) {
        setError(error.message);
      } else {
        setWall(data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    void loadWall();
  }, []);

  useEffect(() => {
    const postsChannel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          setWall((previous) => applyPostChange(previous, payload));
        }
      )
      .subscribe();

    const repliesChannel = supabase
      .channel("public:replies")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "replies" },
        (payload) => {
          setWall((previous) => applyReplyChange(previous, payload));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, []);

  useEffect(() => {
    setOptimisticReplies((current) => {
      let mutated = false;
      const next: Record<string, OptimisticReply | null> = { ...current };
      for (const [postId, optimistic] of Object.entries(current)) {
        if (!optimistic || optimistic.status !== "ready") continue;
        const post = wall.find((entry) => entry.id === postId);
        if (
          post?.replies.some(
            (reply) =>
              reply.is_ai &&
              reply.body.trim().toLowerCase() ===
                optimistic.text.trim().toLowerCase()
          )
        ) {
          next[postId] = null;
          mutated = true;
        }
      }
      return mutated ? next : current;
    });
  }, [wall]);

  const visibleWall = useMemo(() => {
    if (!search.trim()) return wall;
    const query = search.trim().toLowerCase();
    return wall.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        (post.tags ?? []).some((tag) => tag.toLowerCase().includes(query))
    );
  }, [wall, search]);

  const togglePost = (id: string) => {
    setExpanded((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const handleCreatePost = async (input: {
    title: string;
    body: string;
    tags: string[];
  }) => {
    try {
      await createPost(input);
    } catch (error) {
      throw wrapError(error, "Unable to post to the wall");
    }
  };

  const handleReply = async (postId: string, body: string) => {
    setReplyBusy((previous) => ({ ...previous, [postId]: true }));
    try {
      await createReply({ postId, body });
    } catch (error) {
      throw wrapError(error, "Unable to add reply");
    } finally {
      setReplyBusy((previous) => ({ ...previous, [postId]: false }));
    }
  };

  const handleAskAI = async (postId: string, prompt?: string) => {
    setAiBusy((previous) => ({ ...previous, [postId]: true }));
    setOptimisticReplies((previous) => ({
      ...previous,
      [postId]: { status: "thinking", text: "" },
    }));

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId, prompt }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Mentor request failed");
      }

      setOptimisticReplies((previous) => ({
        ...previous,
        [postId]: { status: "ready", text: payload.replyText },
      }));
    } catch (error) {
      setOptimisticReplies((previous) => ({ ...previous, [postId]: null }));
      throw wrapError(error, "Mentor request failed");
    } finally {
      setAiBusy((previous) => ({ ...previous, [postId]: false }));
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Lisbon AI Hackathon
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-gray-900">
          AI Mentor Wall
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Share blockers, watch teammate updates in real-time, and pull in the
          AI mentor for actionable answers.
        </p>
      </header>

      <AuthPanel session={session} />

      {session ? (
        <NewPostForm onCreate={handleCreatePost} />
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-4 text-sm text-gray-600">
          Sign in above to create posts and replies.
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white/70 p-3 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search posts by title, body, or tags"
          className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 text-center text-sm text-gray-500 shadow-sm">
          Loading wall…
        </div>
      ) : visibleWall.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-6 text-center text-sm text-gray-500 shadow-sm">
          No posts yet. Be the first to ask for mentor help!
        </div>
      ) : (
        <div className="space-y-4">
          {visibleWall.map((post) => (
            <PostThread
              key={post.id}
              post={post}
              expanded={expanded[post.id] ?? false}
              onToggle={togglePost}
              onReply={handleReply}
              onAskAI={handleAskAI}
              replyBusy={replyBusy[post.id]}
              aiBusy={aiBusy[post.id]}
              optimisticReply={optimisticReplies[post.id]}
              canReply={Boolean(session)}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}

type RawPayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

function applyPostChange(wall: WallPost[], payload: RawPayload) {
  if (payload.eventType === "DELETE" && payload.old) {
    const removedId = (payload.old as { id?: string }).id;
    return removedId ? wall.filter((post) => post.id !== removedId) : wall;
  }

  const rawNew = payload.new as Partial<WallPost> | null;
  if (!rawNew?.id) {
    return wall;
  }

  const existingReplies =
    wall.find((post) => post.id === rawNew.id)?.replies ?? [];

  const incoming: WallPost = {
    replies: existingReplies,
    ...rawNew,
  } as WallPost;

  const next = wall.some((post) => post.id === incoming.id)
    ? wall.map((post) => (post.id === incoming.id ? incoming : post))
    : [incoming, ...wall];

  return next.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function applyReplyChange(wall: WallPost[], payload: RawPayload) {
  if (payload.eventType === "DELETE" && payload.old) {
    const oldData = payload.old as Partial<Reply>;
    if (!oldData?.post_id || !oldData?.id) {
      return wall;
    }

    return wall.map((post) =>
      post.id === oldData.post_id
        ? {
            ...post,
            replies: post.replies.filter((reply) => reply.id !== oldData.id),
          }
        : post
    );
  }

  const rawNew = payload.new as Partial<Reply> | null;
  if (!rawNew?.post_id || !rawNew?.id) {
    return wall;
  }

  const incoming = rawNew as Reply;

  return wall.map((post) => {
    if (post.id !== incoming.post_id) return post;

    const replies = post.replies.some((reply) => reply.id === incoming.id)
      ? post.replies.map((reply) =>
          reply.id === incoming.id ? incoming : reply
        )
      : [...post.replies, incoming];

    replies.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return { ...post, replies };
  });
}

function wrapError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(fallback);
}
