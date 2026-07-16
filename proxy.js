import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

/**
 * Admin route gate.
 *
 * Redirects unauthenticated visitors away from every /admin page before it
 * renders (cookie-presence check — the JWT itself is verified server-side
 * by verifyAdmin() in every /api/admin/* handler, so a forged cookie only
 * gets an empty shell that can load no data).
 */
export default function proxy(request) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get("admin_token")?.value);
  const isLoginPage = pathname === "/admin/login";

  if (!hasToken && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && (isLoginPage || pathname === "/admin")) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}
