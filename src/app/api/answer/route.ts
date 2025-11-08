import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { title, details } = await req.json();

    if (!title || typeof title !== "string" || title.length > 200) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    const { data: q, error } = await supabase
      .from("questions")
      .insert({
        title,
        details: details ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error || !q) {
      return NextResponse.json(
        { error: error?.message ?? "Insert failed" },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY || !supabaseAdmin) {
      return NextResponse.json({
        id: q.id,
        status: "pending",
        note: "dry-run: enable on-site",
      });
    }

    return NextResponse.json({
      id: q.id,
      status: "pending",
      note: "unreachable in prep mode",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
