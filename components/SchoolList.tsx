"use client"

import { SchoolCard } from "@/components/SchoolCard"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/ui/blur-fade"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface SchoolListProps {
    initialData: any[]
    initialPagination: {
        hasMore: boolean
        offset: number
        limit: number
        total: number
    }
    searchParams: any
}

export function SchoolList({ initialData, initialPagination, searchParams }: SchoolListProps) {
    const [schools, setSchools] = useState(initialData)
    const [pagination, setPagination] = useState(initialPagination)
    const [loading, setLoading] = useState(false)

    // Reset schools when search params change (handled by parent passing new initialData, but we need to sync state)
    useEffect(() => {
        setSchools(initialData)
        setPagination(initialPagination)
    }, [initialData, initialPagination])

    const loadMore = async () => {
        if (loading || !pagination.hasMore) return

        setLoading(true)
        const nextOffset = pagination.offset + pagination.limit

        // Construct query string from searchParams
        const params = new URLSearchParams()
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) params.set(key, value as string)
        })
        params.set("offset", nextOffset.toString())
        params.set("limit", pagination.limit.toString())

        try {
            const res = await fetch(`/api/institutions?${params.toString()}`)
            const data = await res.json()

            if (data.data) {
                setSchools((prev) => {
                    const newSchools = data.data.filter(
                        (newSchool: any) => !prev.some((s) => s.institution_id === newSchool.institution_id)
                    )
                    return [...prev, ...newSchools]
                })
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error("Failed to load more schools", error)
        } finally {
            setLoading(false)
        }
    }

    if (schools.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-lg font-semibold">No schools found</div>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school, idx) => (
                    <BlurFade key={school.institution_id} delay={0.05 * idx} inView>
                        <SchoolCard institution={school} />
                    </BlurFade>
                ))}
            </div>

            {pagination.hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={loadMore}
                        disabled={loading}
                        className="min-w-[150px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
