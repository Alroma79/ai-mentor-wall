"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ChannelStatus = "connecting" | "subscribed" | "error" | "closed";

export default function DebugRealtimePage() {
  const [postsStatus, setPostsStatus] = useState<ChannelStatus>("connecting");
  const [repliesStatus, setRepliesStatus] = useState<ChannelStatus>("connecting");
  const [postsEvents, setPostsEvents] = useState<string[]>([]);
  const [repliesEvents, setRepliesEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔌 Setting up realtime channels...");

    const postsChannel = supabase
      .channel("debug:posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          const timestamp = new Date().toLocaleTimeString();
          const message = `[${timestamp}] ${payload.eventType}: ${JSON.stringify(payload.new || payload.old)}`;
          console.log("📬 Posts event:", message);
          setPostsEvents((prev) => [message, ...prev].slice(0, 10));
        }
      )
      .subscribe((status) => {
        console.log("📡 Posts channel status:", status);
        setPostsStatus(status as ChannelStatus);
        if (status === "CHANNEL_ERROR") {
          setError("Posts channel failed to subscribe. Check Supabase replication settings.");
        }
      });

    const repliesChannel = supabase
      .channel("debug:replies")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "replies" },
        (payload) => {
          const timestamp = new Date().toLocaleTimeString();
          const message = `[${timestamp}] ${payload.eventType}: ${JSON.stringify(payload.new || payload.old)}`;
          console.log("📬 Replies event:", message);
          setRepliesEvents((prev) => [message, ...prev].slice(0, 10));
        }
      )
      .subscribe((status) => {
        console.log("📡 Replies channel status:", status);
        setRepliesStatus(status as ChannelStatus);
        if (status === "CHANNEL_ERROR") {
          setError("Replies channel failed to subscribe. Check Supabase replication settings.");
        }
      });

    return () => {
      console.log("🔌 Cleaning up channels...");
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, []);

  const getStatusColor = (status: ChannelStatus) => {
    switch (status) {
      case "subscribed":
        return "text-green-600 bg-green-50";
      case "connecting":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "closed":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: ChannelStatus) => {
    switch (status) {
      case "subscribed":
        return "✅";
      case "connecting":
        return "⏳";
      case "error":
        return "❌";
      case "closed":
        return "🔌";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          🔍 Realtime Debug Dashboard
        </h1>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ Error:</strong> {error}
            </p>
            <p className="mt-2 text-xs text-red-600">
              Check the guide in <code>REALTIME_FIX_GUIDE.md</code> for solutions.
            </p>
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {/* Posts Channel Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Posts Channel
            </h2>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(postsStatus)}`}
            >
              <span>{getStatusIcon(postsStatus)}</span>
              <span className="uppercase">{postsStatus}</span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Events received: {postsEvents.length}
              </p>
            </div>
          </div>

          {/* Replies Channel Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Replies Channel
            </h2>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(repliesStatus)}`}
            >
              <span>{getStatusIcon(repliesStatus)}</span>
              <span className="uppercase">{repliesStatus}</span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Events received: {repliesEvents.length}
              </p>
            </div>
          </div>
        </div>

        {/* Events Log */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Posts Events */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Posts Events
            </h3>
            <div className="space-y-2">
              {postsEvents.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No events yet. Create a post to test!
                </p>
              ) : (
                postsEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-gray-100 bg-gray-50 p-2 text-xs font-mono text-gray-700"
                  >
                    {event}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Replies Events */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Replies Events
            </h3>
            <div className="space-y-2">
              {repliesEvents.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No events yet. Add a reply to test!
                </p>
              ) : (
                repliesEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-gray-100 bg-gray-50 p-2 text-xs font-mono text-gray-700"
                  >
                    {event}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-3 text-sm font-semibold text-blue-900">
            📋 How to Test
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>
              1. Keep this page open and watch the channel status above
            </li>
            <li>
              2. Open your main app in another tab:{" "}
              <a href="/" className="underline">
                /
              </a>
            </li>
            <li>3. Create a new post or add a reply</li>
            <li>4. Watch the events appear here in real-time!</li>
          </ol>
          <p className="mt-4 text-xs text-blue-700">
            💡 If status shows "error" or "connecting" for more than 5 seconds,
            check <code>REALTIME_FIX_GUIDE.md</code>
          </p>
        </div>

        {/* Environment Info */}
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
            Environment
          </h3>
          <div className="space-y-1 text-xs font-mono text-gray-600">
            <p>
              Supabase URL:{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...
            </p>
            <p>
              Anon Key:{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

