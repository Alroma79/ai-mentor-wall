import { NextRequest, NextResponse } from "next/server";

function resolveSiteUrl(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }

  if (configured && !/^https?:\/\//i.test(configured)) {
    return `https://${configured}`;
  }

  return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

export async function GET(request: NextRequest) {
  const siteUrl = resolveSiteUrl(request);
  return NextResponse.redirect(new URL("/", siteUrl));
}
