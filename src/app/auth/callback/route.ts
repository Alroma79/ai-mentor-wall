import { NextResponse } from "next/server";

const fallbackSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET() {
  return NextResponse.redirect(new URL("/", fallbackSiteUrl));
}
