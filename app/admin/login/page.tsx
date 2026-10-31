import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { auth, signIn } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata = { title: "Admin sign in | Wealth Lab", robots: { index: false, follow: false } }

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if ((await auth())?.user.role === "admin") redirect("/admin/portal")
  const { error } = await searchParams
  const configured = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12 && process.env.AUTH_SECRET)

  async function login(formData: FormData) {
    "use server"
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin/portal",
      })
    } catch (failure) {
      if (failure instanceof AuthError) redirect("/admin/login?error=credentials")
      throw failure
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Wealth Lab Admin</CardTitle>
          <CardDescription>One dashboard for the 2026 archive and 2027 community feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          {!configured && <p role="alert" className="mb-6 text-danger">Admin access is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD (at least 12 characters), and AUTH_SECRET on the server.</p>}
          {error && <p role="alert" className="mb-6 text-danger">Unable to sign in. Check your email and password and try again.</p>}
          <form action={login} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} /></div>
            <div className="space-y-2"><Label htmlFor="admin-password">Password</Label><Input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} /></div>
            <Button type="submit" disabled={!configured} className="w-full">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
