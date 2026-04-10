import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // NextAuth v5 uses "authjs.session-token" (dev) or "__Secure-authjs.session-token" (prod/https)
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    // Fallback: also check legacy names just in case
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  const currentPath = request.nextUrl.pathname;

  // Protect dashboard routes
  if (currentPath.startsWith("/dashboard")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Prevent logged-in users from accessing auth pages
  if (currentPath === "/login" || currentPath === "/register") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
