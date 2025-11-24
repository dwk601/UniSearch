"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Dock, DockIcon } from "@/components/ui/dock"
import { cn } from "@/lib/utils"
import {
  Home,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
} from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Helper to check if link is active
  const isActive = (path: string) => pathname === path

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex justify-center p-4">
      <Dock className="pointer-events-auto relative mx-auto flex items-center px-1 bg-background/80 border shadow-lg mt-0 h-auto">
        <DockIcon className={cn("hover:bg-muted/50 transition-colors", isActive("/") && "bg-muted/50")}>
          <Link href="/" aria-label="Home" className="size-full flex items-center justify-center">
            <Home className={cn("size-5", isActive("/") && "text-primary")} />
          </Link>
        </DockIcon>
        <DockIcon className={cn("hover:bg-muted/50 transition-colors", isActive("/schools") && "bg-muted/50")}>
          <Link href="/schools" aria-label="Schools" className="size-full flex items-center justify-center">
            <GraduationCap className={cn("size-5", isActive("/schools") && "text-primary")} />
          </Link>
        </DockIcon>
        
        {user && (
          <DockIcon className={cn("hover:bg-muted/50 transition-colors", isActive("/dashboard") && "bg-muted/50")}>
            <Link href="/dashboard" aria-label="Dashboard" className="size-full flex items-center justify-center">
              <LayoutDashboard className={cn("size-5", isActive("/dashboard") && "text-primary")} />
            </Link>
          </DockIcon>
        )}

        <div className="h-8 w-[1px] bg-border mx-1"></div>

        {user ? (
           <DockIcon className="hover:bg-muted/50 transition-colors">
             <button onClick={() => signOut()} aria-label="Logout" className="size-full flex items-center justify-center">
               <LogOut className="size-5 text-destructive" />
             </button>
           </DockIcon>
        ) : (
          <DockIcon className={cn("hover:bg-muted/50 transition-colors", isActive("/login") && "bg-muted/50")}>
            <Link href="/login" aria-label="Login" className="size-full flex items-center justify-center">
              <LogIn className={cn("size-5", isActive("/login") && "text-primary")} />
            </Link>
          </DockIcon>
        )}
      </Dock>
    </div>
  )
}
