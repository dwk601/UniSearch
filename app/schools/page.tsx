import { FilterSidebar } from "@/components/FilterSidebar"
import { SearchBar } from "@/components/SearchBar"
import { SchoolList } from "@/components/SchoolList"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/components/LogoutButton"

import { SortSelect } from "@/components/SortSelect"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explore Schools",
  description: "Search and filter through thousands of US undergraduate institutions. Find the perfect match for your academic goals with our advanced search tools.",
}

// Force dynamic rendering since we use searchParams
export const dynamic = "force-dynamic"

export default async function SchoolsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { getInstitutions, getInstitutionsCount, getStates, getCities } = await import("@/lib/institutions")

    const offset = parseInt((resolvedSearchParams.offset as string) || "0")
    const limit = parseInt((resolvedSearchParams.limit as string) || "20")

    // Prepare params object
    const params = {
        query: (resolvedSearchParams.query as string) || undefined,
        state: (resolvedSearchParams.state as string) || undefined,
        city: (resolvedSearchParams.city as string) || undefined,
        institution_control: (resolvedSearchParams.institution_control as string) || undefined,
        institution_level: (resolvedSearchParams.institution_level as string) || undefined,
        locale: (resolvedSearchParams.locale as string) || undefined,
        major: (resolvedSearchParams.major as string) || undefined,
        min_rank: resolvedSearchParams.min_rank ? parseInt(resolvedSearchParams.min_rank as string) : undefined,
        max_rank: resolvedSearchParams.max_rank ? parseInt(resolvedSearchParams.max_rank as string) : undefined,
        toefl_score: resolvedSearchParams.toefl_score ? parseInt(resolvedSearchParams.toefl_score as string) : undefined,
        ielts_score: resolvedSearchParams.ielts_score ? parseFloat(resolvedSearchParams.ielts_score as string) : undefined,
        max_tuition_intl: resolvedSearchParams.max_tuition_intl ? parseInt(resolvedSearchParams.max_tuition_intl as string) : undefined,
        min_acceptance_rate: resolvedSearchParams.min_acceptance_rate ? parseInt(resolvedSearchParams.min_acceptance_rate as string) : undefined,
        min_intl_percent: resolvedSearchParams.min_intl_percent ? parseFloat(resolvedSearchParams.min_intl_percent as string) : undefined,
        only_ranked: resolvedSearchParams.only_ranked === 'true',
        sort: (resolvedSearchParams.sort as "rank_asc" | "rank_desc" | "name_asc" | "name_desc" | undefined),
        limit,
        offset,
    }

    const data = await getInstitutions(supabase, params)
    const totalCount = await getInstitutionsCount(supabase, params)
    const states = await getStates(supabase)
    const cities = await getCities(supabase)

    // Fetch saved schools if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    let savedSchoolIds: number[] = []
    if (user) {
        const { data: saved } = await supabase
            .from("saved_schools")
            .select("institution_id")
            .eq("user_id", user.id)
        
        if (saved) {
            savedSchoolIds = saved.map(s => s.institution_id)
        }
    }

    const responseData = {
        data: data || [],
        pagination: {
            total: totalCount || 0,
            offset,
            limit,
            hasMore: (totalCount || 0) > offset + limit
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <DotPattern
                className={cn(
                    "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
                )}
            />
            {/* Header / Search Area */}
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="font-bold text-xl tracking-tight">UniSearch</div>
                    <div className="flex-1 max-w-xl">
                        <SearchBar />
                    </div>
                    <div className="flex items-center justify-end w-[120px]">
                        <LogoutButton />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    {/* Sidebar */}
                    <aside className="space-y-8 w-full max-w-xs mx-auto lg:max-w-none lg:mx-0">
                        <div className="sticky top-24 border rounded-lg p-4 bg-card/50 backdrop-blur-sm shadow-sm">
                            <FilterSidebar states={states} cities={cities} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="min-w-0">
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Schools</h1>
                                <p className="text-muted-foreground">
                                    Find the perfect college for your future.
                                </p>
                            </div>
                            <SortSelect />
                        </div>

                        <SchoolList
                            initialData={responseData.data}
                            initialPagination={responseData.pagination}
                            searchParams={resolvedSearchParams}
                            savedSchoolIds={savedSchoolIds}
                        />
                    </main>
                </div>
            </div>
        </div>
    )
}
