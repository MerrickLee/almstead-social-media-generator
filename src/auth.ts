import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { isEmailAllowed, getUserRole } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            if (user.email) {
                const isAllowed = await isEmailAllowed(user.email);
                if (isAllowed) {
                    return true;
                }
            }
            // If we reach here, user email is not permitted. Access Denied.
            return false;
        },
        async session({ session, token }) {
            if (session.user?.email) {
                const role = await getUserRole(session.user.email);
                session.user.role = role;
            }
            return session;
        },
    },
})
