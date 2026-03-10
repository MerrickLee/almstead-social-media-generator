import GoogleProvider from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

// Export the edge-compatible configuration
export const authConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');

            if (isAuthRoute) return true;

            return isLoggedIn;
        },
    },
} satisfies NextAuthConfig;
