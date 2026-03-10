import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { isEmailAllowed } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            if (user.email) {
                // Only allow login if email matches Admin or is in the Allowlist DB
                const isAllowed = await isEmailAllowed(user.email);
                if (isAllowed) {
                    return true;
                }
            }
            // If we reach here, user email is not permitted. Access Denied.
            return false;
        },
    },
})
