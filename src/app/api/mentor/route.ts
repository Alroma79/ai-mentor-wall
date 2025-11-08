import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openAiKey = process.env.OPENAI_API_KEY;

if (!url || !anonKey) {
  throw new Error("Missing Supabase environment variables");
}

const serverClient =
  supabaseAdmin ??
  createClient(url, anonKey, {
    auth: { persistSession: false },
  });

const SYSTEM_PROMPT =
  "You are the AI mentor for a hackathon wall. Respond with short, actionable advice and numbered steps when helpful. Keep it under 6 sentences.";

export async function POST(request: Request) {
  if (!openAiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const postId: string | undefined = body.postId;
    const userPrompt: string | undefined = body.prompt;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required." },
        { status: 400 }
      );
    }

    const { data: post, error: postError } = await serverClient
      .from("posts")
      .select("id,title,body,tags")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: postError?.message ?? "Post not found." },
        { status: 404 }
      );
    }

    const details =
      userPrompt ??
      [
        `Title: ${post.title}`,
        `Body: ${post.body}`,
        post.tags && post.tags.length > 0
          ? `Tags: ${post.tags.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `${details}\n\nRespond as the mentor.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.error?.message ?? "OpenAI request failed." },
        { status: 500 }
      );
    }

    const completion = await aiResponse.json();
    const replyText: string | undefined =
      completion.choices?.[0]?.message?.content?.trim();

    if (!replyText) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response." },
        { status: 500 }
      );
    }

    const { error: insertError } = await serverClient.from("replies").insert({
      post_id: postId,
      body: replyText,
      is_ai: true,
    });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ replyText });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
