import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            if (user.email) {
                // Temporary hardcoded allowlist until we migrate to a serverless database.
                const allowedEmails = [
                    'mlee@almstead.com',
                    'merricklee@me.com',
                ];
                if (allowedEmails.includes(user.email.toLowerCase())) {
                    return true;
                }
            }
            // If we reach here, user email is not permitted. Access Denied.
            return false;
        },
    },
})
