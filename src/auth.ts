import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            if (user.email) {
                // Hardcoded Admin email for now, until we migrate away from local SQLite
                // to a serverless-friendly database like Vercel Postgres or Supabase.
                if (user.email.toLowerCase() === 'mlee@almstead.com') {
                    return true;
                }
            }
            // If we reach here, user email is not permitted. Access Denied.
            return false;
        },
    },
})
