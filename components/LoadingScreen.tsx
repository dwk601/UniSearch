"use client"

import { GridPattern } from "@/components/ui/grid-pattern"
import { cn } from "@/lib/utils"

export function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />
      <div className="z-10 flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
