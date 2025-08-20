import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and auth routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/auth/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const user = session?.user;

    // Check if route requires authentication
    const isProtectedRoute = pathname.startsWith("/portal") || pathname.startsWith("/admin");

    if (isProtectedRoute && !user) {
      // Redirect to signin with return URL
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (user) {
      // Role-based access control
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        // Non-admin trying to access admin routes - redirect to their portal
        return NextResponse.redirect(new URL("/portal", request.url));
      }

      if (pathname.startsWith("/portal") && user.role === "admin") {
        // Admin trying to access donor portal - redirect to admin panel
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      // If user is on auth pages but already authenticated, redirect to their portal
      if (pathname.startsWith("/auth/")) {
        const redirectUrl = user.role === "admin" ? "/admin" : "/portal";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // If there's an error and it's a protected route, redirect to signin
    const isProtectedRoute = pathname.startsWith("/portal") || pathname.startsWith("/admin");
    if (isProtectedRoute) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
