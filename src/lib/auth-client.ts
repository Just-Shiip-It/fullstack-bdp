import { createAuthClient } from "better-auth/react";
import type { User } from "./auth";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export type { User };

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