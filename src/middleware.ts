import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// NextAuth returns a middleware function when initialized
export default NextAuth(authConfig).auth;

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
