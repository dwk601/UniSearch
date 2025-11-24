"use client"

import { useAuth } from "@/lib/auth-context"
import { LoadingScreen } from "@/components/LoadingScreen"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth()

  if (!isInitialized) {
    return <LoadingScreen />
  }

  return <>{children}</>
}
