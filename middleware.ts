import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("auth_token")?.value ||
    req.headers.get("authorization")?.replace(/^Bearer /i, "");

  if (req.nextUrl.pathname.startsWith("/produtos") && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set(
      "redirectTo",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/produtos/:path*"],
};
