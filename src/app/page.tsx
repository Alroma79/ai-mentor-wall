"use client";

import { useEffect, useState } from "react";
import { insertQuestion, listQuestions } from "@/lib/db";

type QuestionItem =
  Awaited<ReturnType<typeof listQuestions>>["data"] extends (infer U)[] | null
    ? U
    : never;

export default function Home() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [items, setItems] = useState<QuestionItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data, error } = await listQuestions();
    if (error) {
      setError(error.message);
      return;
    }
    setItems(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const ask = async () => {
    if (!title.trim()) return;
    setError(null);
    setSubmitting(true);

    try {
      const trimmedTitle = title.trim();
      const trimmedDetails = details.trim();

      const { data: created, error } = await insertQuestion({
        title: trimmedTitle,
        details: trimmedDetails || undefined,
      });

      if (error || !created) {
        throw new Error(error?.message ?? "Insert failed");
      }

      await fetch("/api/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          details: trimmedDetails || undefined,
        }),
      });

      setTitle("");
      setDetails("");
      await load();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit question";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">AI Mentor Wall (Prep)</h1>
      <p className="mb-6 text-sm text-gray-600">
        Environment-only mode: questions are stored; AI answering is disabled
        until on-site setup.
      </p>

      <div className="mb-4 space-y-2 rounded-xl border border-gray-200 p-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="Your question (≤ 200 chars)"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="More context (optional)"
          className="min-h-[6rem] w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          onClick={ask}
          disabled={submitting || !title.trim()}
          className="rounded border border-gray-900 px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? "Submitting" : "Ask AI"}
        </button>
      </div>

      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {items === null && (
          <li className="px-4 py-6 text-center text-sm text-gray-500">
            Loading questions...
          </li>
        )}
        {items?.map((question) => (
          <li key={question.id} className="space-y-1 px-4 py-3">
            <div className="font-medium">{question.title}</div>
            {question.details ? (
              <div className="whitespace-pre-wrap text-sm text-gray-600">
                {question.details}
              </div>
            ) : null}
            <span className="text-xs text-gray-500">
              Status: {question.status}
            </span>
          </li>
        ))}
        {items && items.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-gray-500">
            No questions yet.
          </li>
        )}
      </ul>
    </main>
  );
}
