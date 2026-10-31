import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createHash, timingSafeEqual } from "node:crypto"

function matchesPassword(input: string, expected: string) {
  return timingSafeEqual(
    createHash("sha256").update(input).digest(),
    createHash("sha256").update(expected).digest(),
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
        const password = process.env.ADMIN_PASSWORD
        if (!email || !password || password.length < 12 || !process.env.AUTH_SECRET) {
          console.error("Admin login requires ADMIN_EMAIL, ADMIN_PASSWORD (12+ characters), and AUTH_SECRET.")
          return null
        }
        if (typeof credentials.email !== "string" || typeof credentials.password !== "string") return null
        const validPassword = matchesPassword(credentials.password, password)
        if (credentials.email.trim().toLowerCase() !== email || !validPassword) return null
        return { id: email, email, name: "Admin", role: "admin" }
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub ?? ""
      session.user.role = token.role === "admin" ? "admin" : ""
      return session
    },
  },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
})
