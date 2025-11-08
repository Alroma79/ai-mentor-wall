"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Completing sign in…");
  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    const finalizeSignIn = async () => {
      const params = new URLSearchParams(searchParamsString);
      const error = params.get("error") ?? params.get("error_description");
      if (error) {
        setStatus(`Sign-in failed: ${error}`);
        return;
      }

      if (typeof window === "undefined") return;

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (exchangeError) {
        setStatus(`Sign-in failed: ${exchangeError.message}`);
        return;
      }

      router.replace("/");
    };

    void finalizeSignIn();
  }, [router, searchParamsString]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
        <p className="text-sm text-gray-600">{status}</p>
      </div>
    </main>
  );
}
