"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce" // Assuming this hook exists or I'll create it, or just implement debounce here.

// I'll implement simple debounce here to avoid dependency on missing hook
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

export function SearchBar() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const [query, setQuery] = useState(searchParams.get("query") || "")
    const debouncedQuery = useDebounceValue(query, 500)

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            // Reset pagination when searching
            params.delete("offset")
            return params.toString()
        },
        [searchParams]
    )

    useEffect(() => {
        // Only update URL if the query actually changed from what's in URL
        const currentQuery = searchParams.get("query") || ""
        if (debouncedQuery !== currentQuery) {
            router.push(pathname + "?" + createQueryString("query", debouncedQuery))
        }
    }, [debouncedQuery, createQueryString, pathname, router, searchParams])

    return (
        <div className="relative w-full max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search for colleges..."
                className="pl-10 h-12 rounded-full bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus-visible:ring-primary/20 shadow-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    )
}
