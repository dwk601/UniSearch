"use client"

import { ShinyButton } from "@/components/ui/shiny-button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <ShinyButton onClick={handleSignOut} className="bg-background">
      Log out
    </ShinyButton>
  )
}
