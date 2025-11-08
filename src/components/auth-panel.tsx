"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthPanelProps = {
  session: Session | null;
};

export default function AuthPanel({ session }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const sendMagicLink = async () => {
    if (!email.trim()) {
      setStatus("Enter an email to receive a sign-in link.");
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("Magic link sent! Check your inbox.");
      setEmail("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send email link";
      setStatus(message);
    } finally {
      setSubmitting(false);
    }
  };

  const signInWithGitHub = async () => {
    setStatus(null);
    setOauthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "GitHub sign-in failed";
      setStatus(message);
    } finally {
      setOauthLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          Signed in as{" "}
          <span className="font-semibold text-gray-900">
            {session.user.email ?? session.user.id}
          </span>
        </div>
        <button
          className="rounded-full border border-gray-900 px-4 py-1.5 text-sm font-semibold"
          onClick={signOut}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-4 shadow-sm">
      <p className="mb-3 text-sm text-gray-600">
        Sign in with a magic link to post questions and chat with the mentor.
      </p>
      <button
        onClick={signInWithGitHub}
        disabled={oauthLoading}
        className="mb-4 w-full rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold disabled:opacity-60 sm:w-auto"
      >
        {oauthLoading ? "Connecting…" : "Sign in with GitHub"}
      </button>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        <button
          onClick={sendMagicLink}
          disabled={submitting}
          className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send magic link"}
        </button>
      </div>
      {status && <p className="mt-2 text-sm text-gray-500">{status}</p>}
    </div>
  );
}
