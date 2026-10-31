import { readData, writeData } from "./data-store"

export const FEATURE_FLAGS_KEY = "feature-flags"
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase()

export interface FeatureFlags {
  loginEnabled: boolean
  attendanceEnabled: boolean
  labSubmissionsEnabled: boolean
  questionsEnabled: boolean
  hotSeatsEnabled: boolean
  feedbackEnabled: boolean
  commitmentEnabled: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  loginEnabled: true,
  attendanceEnabled: true,
  labSubmissionsEnabled: true,
  questionsEnabled: true,
  hotSeatsEnabled: true,
  feedbackEnabled: true,
  commitmentEnabled: true,
}

function normalizeFeatureFlags(payload?: Partial<FeatureFlags>): FeatureFlags {
  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...(payload ?? {}),
  }
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const records = await readData<Partial<FeatureFlags>>(FEATURE_FLAGS_KEY)
  return normalizeFeatureFlags(records[0])
}

export async function updateFeatureFlags(partial: Partial<FeatureFlags>): Promise<FeatureFlags> {
  const current = await getFeatureFlags()
  const next = normalizeFeatureFlags({ ...current, ...partial })
  await writeData(FEATURE_FLAGS_KEY, [next])
  return next
}

export function isAdminSession(session: any): boolean {
  return (
    session?.user?.role === "admin"
  )
}

export function isFeatureEnabledForSession(
  flags: FeatureFlags,
  key: keyof FeatureFlags,
  session: any
): boolean {
  return isAdminSession(session) || flags[key]
}
