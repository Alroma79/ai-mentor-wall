import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: post, error } = await client
    .from("posts")
    .insert({
      title: "Demo: Ask the mentor to unblock us",
      body: [
        "This seed was created via scripts/seed.ts.",
        "Use it to verify realtime updates before the hackathon kicks off.",
      ].join(" "),
      tags: ["demo", "seed"],
      author: null,
    })
    .select()
    .single();

  if (error || !post) {
    throw error ?? new Error("Failed to insert demo post.");
  }

  const { error: repliesError } = await client.from("replies").insert([
    {
      post_id: post.id,
      body: "Add a human reply or click Ask AI Mentor to watch realtime.",
      is_ai: false,
    },
    {
      post_id: post.id,
      body: "AI mentor ready. Hit the purple button above to see a fresh answer.",
      is_ai: true,
    },
  ]);

  if (repliesError) {
    throw repliesError;
  }

  console.log(`Seeded demo wall post (${post.id}).`);
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
