"use client";

import { useState } from "react";

type FormState = {
  title: string;
  body: string;
  tags: string;
};

type NewPostFormProps = {
  onCreate: (input: { title: string; body: string; tags: string[] }) => Promise<void>;
  disabled?: boolean;
};

export default function NewPostForm({ onCreate, disabled = false }: NewPostFormProps) {
  const [form, setForm] = useState<FormState>({ title: "", body: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await onCreate({
        title: form.title.trim(),
        body: form.body.trim(),
        tags,
      });
      setForm({ title: "", body: "", tags: "" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
      <div className="space-y-3">
        <input
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="Post title"
          maxLength={160}
          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        <textarea
          value={form.body}
          onChange={(event) => update("body", event.target.value)}
          placeholder="What do you need help with?"
          className="min-h-[120px] w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        <input
          value={form.tags}
          onChange={(event) => update("tags", event.target.value)}
          placeholder="Tags (comma separated)"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={disabled || submitting}
            className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post to wall"}
          </button>
        </div>
      </div>
    </div>
  );
}
