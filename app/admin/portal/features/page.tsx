import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getFeatureFlags } from "@/lib/feature-flags"
import FeatureFlagsForm from "@/components/admin/feature-flags-form"

export default async function AdminFeaturesPage() {
  const session = await auth()

  if (!session || session.user?.role !== "admin") {
    redirect("/portal")
  }

  const flags = await getFeatureFlags()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Feature Flags</h1>
        <p className="text-gray-400">
          Configure portal capabilities without changing source code.
        </p>
      </div>
      <FeatureFlagsForm initialFlags={flags} />
    </div>
  )
}
