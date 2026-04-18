import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const cookie = getSessionCookie(req);
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/expenses/:path*",
    "/bills/:path*",
    "/subscriptions/:path*",
    "/income/:path*",
    "/tax/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
