import { auth, type Session, type User } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "user" | "admin";

/**
 * Get the current session on the server side
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get the current user on the server side
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user as User | null;
}

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, "admin");
}

/**
 * Check if user is regular user/donor
 */
export function isDonor(user: User | null): boolean {
  return hasRole(user, "user");
}

/**
 * Require authentication - redirect to signin if not authenticated
 */
export async function requireAuth(redirectTo?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const redirectUrl = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/auth/signin${redirectUrl}`);
  }
  return user;
}

/**
 * Require specific role - redirect if user doesn't have required role
 */
export async function requireRole(
  requiredRole: UserRole,
  redirectTo?: string
): Promise<User> {
  const user = await requireAuth(redirectTo);

  if (!hasRole(user, requiredRole)) {
    // Redirect based on user's actual role
    if (user.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/portal");
    }
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(redirectTo?: string): Promise<User> {
  return requireRole("admin", redirectTo);
}

/**
 * Require donor role
 */
export async function requireDonor(redirectTo?: string): Promise<User> {
  return requireRole("user", redirectTo);
}

/**
 * Get redirect URL based on user role
 */
export function getRoleBasedRedirect(user: User): string {
  switch (user.role) {
    case "admin":
      return "/admin";
    case "user":
    default:
      return "/portal";
  }
}

/**
 * Check if route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/portal", "/admin"];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires specific role
 */
export function getRequiredRole(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }
  if (pathname.startsWith("/portal")) {
    return "user";
  }
  return null;
}
