"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "rank_asc"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    // Reset offset when sorting changes
    params.set("offset", "0")
    router.push(`/schools?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="rank_asc">Rank (High to Low)</SelectItem>
        <SelectItem value="rank_desc">Rank (Low to High)</SelectItem>
        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
      </SelectContent>
    </Select>
  )
}
