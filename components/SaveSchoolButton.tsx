"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toggleSavedSchool } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface SaveSchoolButtonProps {
  institutionId: number
  initialIsSaved?: boolean
  onToggle?: (isSaved: boolean) => void
  className?: string
}

export function SaveSchoolButton({ 
  institutionId, 
  initialIsSaved = false, 
  onToggle,
  className 
}: SaveSchoolButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (loading) return

    setLoading(true)
    // Optimistic update
    const newState = !isSaved
    setIsSaved(newState)

    try {
      const result = await toggleSavedSchool(institutionId)
      setIsSaved(result.saved)
      if (onToggle) onToggle(result.saved)
    } catch (error) {
      // Revert
      setIsSaved(!newState)
      const err = error as Error
      if (err.message === "Unauthorized") {
        router.push("/login")
      } else {
        alert(err.message || "Failed to save school")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 rounded-full hover:bg-muted", className)}
      onClick={handleToggle}
      disabled={loading}
    >
      <Heart 
        className={cn(
          "h-5 w-5 transition-colors", 
          isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )} 
      />
      <span className="sr-only">{isSaved ? "Unsave" : "Save"} school</span>
    </Button>
  )
}
