"use client";

import { useMemo, useState } from "react";
import type { Reply, WallPost } from "@/lib/types";
import { relativeTimeFromNow } from "@/lib/time";

export type OptimisticReply = {
  status: "thinking" | "ready";
  text: string;
};

type PostThreadProps = {
  post: WallPost;
  expanded: boolean;
  onToggle: (id: string) => void;
  onReply: (postId: string, body: string) => Promise<void>;
  onAskAI: (postId: string, prompt?: string) => Promise<void>;
  replyBusy?: boolean;
  aiBusy?: boolean;
  optimisticReply?: OptimisticReply | null;
  canReply: boolean;
  currentUserId?: string | null;
};

export default function PostThread({
  post,
  expanded,
  onToggle,
  onReply,
  onAskAI,
  replyBusy = false,
  aiBusy = false,
  optimisticReply,
  canReply,
  currentUserId,
}: PostThreadProps) {
  const [replyValue, setReplyValue] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [mentorPrompt, setMentorPrompt] = useState("");

  const replies = useMemo(() => post.replies ?? [], [post.replies]);

  const submitReply = async () => {
    if (!replyValue.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyError(null);
    try {
      await onReply(post.id, replyValue.trim());
      setReplyValue("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add reply";
      setReplyError(message);
    }
  };

  const triggerMentor = async () => {
    setAiError(null);
    try {
      await onAskAI(post.id, mentorPrompt.trim() || undefined);
      if (mentorPrompt.trim()) {
        setMentorPrompt("");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Mentor request failed";
      setAiError(message);
    }
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm">
      <button
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-gray-50"
        onClick={() => onToggle(post.id)}
      >
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {post.title}
          </h2>
          <p className="text-sm text-gray-500">
            {relativeTimeFromNow(post.created_at)}
          </p>
        </div>
        <span className="text-xs font-medium text-gray-600">
          {replies.length} repl{replies.length === 1 ? "y" : "ies"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-gray-100 p-4">
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {post.body}
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {replies.map((reply) => (
              <ReplyBubble
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
              />
            ))}
            {optimisticReply && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-600">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-600">
                  AI Mentor
                  {optimisticReply.status === "thinking" && (
                    <span className="animate-pulse">…</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-700">
                  {optimisticReply.status === "thinking"
                    ? "Thinking through the best answer…"
                    : optimisticReply.text}
                </p>
              </div>
            )}
            {replies.length === 0 && !optimisticReply && (
              <p className="text-sm text-gray-500">No replies yet.</p>
            )}
          </div>

          {canReply ? (
            <div className="space-y-2">
              <textarea
                value={replyValue}
                onChange={(event) => setReplyValue(event.target.value)}
                placeholder="Share context or an update…"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
              {replyError && (
                <p className="text-sm text-red-600">{replyError}</p>
              )}
              <input
                value={mentorPrompt}
                onChange={(event) => setMentorPrompt(event.target.value)}
                placeholder="Extra context just for the AI mentor (optional)"
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={submitReply}
                  disabled={replyBusy || !replyValue.trim()}
                  className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {replyBusy ? "Posting…" : "Reply"}
                </button>
                <button
                  onClick={triggerMentor}
                  disabled={aiBusy}
                  className="rounded-full border border-purple-600 px-4 py-2 text-sm font-semibold text-purple-700 disabled:opacity-60"
                >
                  {aiBusy ? "Mentor thinking…" : "Ask AI Mentor"}
                </button>
                {aiError && (
                  <p className="text-sm text-red-600">{aiError}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Sign in to reply or ask the mentor.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function ReplyBubble({
  reply,
  currentUserId,
}: {
  reply: Reply;
  currentUserId?: string | null;
}) {
  const label = reply.is_ai
    ? "AI Mentor"
    : reply.author === currentUserId
      ? "You"
      : "Teammate";

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
        <span className={reply.is_ai ? "text-purple-700" : undefined}>
          {label}
        </span>
        <span>{relativeTimeFromNow(reply.created_at)}</span>
      </div>
      <p className="mt-2 text-sm text-gray-800">{reply.body}</p>
    </div>
  );
}
