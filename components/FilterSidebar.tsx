"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState, useEffect } from "react"

export function FilterSidebar({ states = [], cities = [] }: { states: string[], cities: { name: string, state: string }[] }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // State for filters
    const [onlyRanked, setOnlyRanked] = useState(
        searchParams.get("only_ranked") === "true"
    )
    const [tuitionMax, setTuitionMax] = useState(
        parseInt(searchParams.get("max_tuition_intl") || "100000")
    )
    const [toeflMin, setToeflMin] = useState(
        parseInt(searchParams.get("toefl_score") || "120")
    )
    const [acceptanceRateMin, setAcceptanceRateMin] = useState(
        parseInt(searchParams.get("min_acceptance_rate") || "0")
    )
    const [intlPercentMin, setIntlPercentMin] = useState(
        parseInt(searchParams.get("min_intl_percent") || "0")
    )

    const selectedState = searchParams.get("state") || "all"
    const filteredCities = selectedState === "all" 
        ? cities 
        : cities.filter(c => c.state === selectedState)

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString())

            Object.entries(params).forEach(([key, value]) => {
                if (value === null) {
                    newSearchParams.delete(key)
                } else {
                    newSearchParams.set(key, value)
                }
            })

            // Reset pagination
            newSearchParams.delete("offset")

            return newSearchParams.toString()
        },
        [searchParams]
    )

    const applyFilters = () => {
        const params = {
            only_ranked: onlyRanked ? "true" : null,
            max_tuition_intl: tuitionMax.toString(),
            toefl_score: toeflMin.toString(),
            min_acceptance_rate: acceptanceRateMin.toString(),
            min_intl_percent: intlPercentMin.toString(),
        }
        router.push(pathname + "?" + createQueryString(params))
    }

    // Effect to trigger filter application when checkbox changes
    useEffect(() => {
        // We only want to trigger this when onlyRanked changes, 
        // but we need to be careful not to trigger it on initial load if it matches URL.
        // However, since we initialize state from URL, if user clicks checkbox, state changes, we should update URL.
        // But applyFilters uses current state of other filters too.
        
        // To avoid complex effect dependencies, we can just call applyFilters in the onChange handler of the checkbox.
        // But applyFilters uses state values which might be stale if we don't use the updated value.
        // So we should pass the new value to applyFilters or update state and then trigger.
        // The easiest way for checkbox is to update state and then call a version of applyFilters that uses the new value.
        
        // Actually, for sliders we use onValueCommit. For checkbox we can use onCheckedChange.
        // But we need to make sure we use the *new* value of onlyRanked.
    }, [onlyRanked])

    const handleRankedChange = (checked: boolean) => {
        setOnlyRanked(checked)
        const params = {
            only_ranked: checked ? "true" : null,
            max_tuition_intl: tuitionMax.toString(),
            toefl_score: toeflMin.toString(),
            min_acceptance_rate: acceptanceRateMin.toString(),
            min_intl_percent: intlPercentMin.toString(),
        }
        router.push(pathname + "?" + createQueryString(params))
    }

    const clearFilters = () => {
        router.push(pathname)
        setOnlyRanked(false)
        setTuitionMax(100000)
        setToeflMin(120)
        setAcceptanceRateMin(0)
        setIntlPercentMin(0)
    }

    return (
        <div className="w-full space-y-6 p-1">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground">
                    Reset
                </Button>
            </div>

            <Separator />

            {/* Rank Filter */}
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="ranked" 
                    checked={onlyRanked}
                    onCheckedChange={(checked) => handleRankedChange(checked as boolean)}
                />
                <Label htmlFor="ranked" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Show only ranked schools
                </Label>
            </div>

            <Separator />

            {/* Tuition Filter */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Max Tuition (Intl)</Label>
                    <span className="text-xs text-muted-foreground">
                        ${tuitionMax.toLocaleString()}
                    </span>
                </div>
                <Slider
                    defaultValue={[100000]}
                    value={[tuitionMax]}
                    min={0}
                    max={100000}
                    step={1000}
                    onValueChange={(vals) => setTuitionMax(vals[0])}
                    onValueCommit={applyFilters}
                />
            </div>

            <Separator />

            {/* TOEFL Filter */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Max TOEFL Score</Label>
                    <span className="text-xs text-muted-foreground">
                        {toeflMin}
                    </span>
                </div>
                <Slider
                    defaultValue={[120]}
                    value={[toeflMin]}
                    min={0}
                    max={120}
                    step={1}
                    onValueChange={(vals) => setToeflMin(vals[0])}
                    onValueCommit={applyFilters}
                />
            </div>

            <Separator />

            {/* Acceptance Rate Filter */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Min Acceptance Rate</Label>
                    <span className="text-xs text-muted-foreground">
                        {acceptanceRateMin}%
                    </span>
                </div>
                <Slider
                    defaultValue={[0]}
                    value={[acceptanceRateMin]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(vals) => setAcceptanceRateMin(vals[0])}
                    onValueCommit={applyFilters}
                />
            </div>

            <Separator />

            {/* International Student % Filter */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label>Min International Student %</Label>
                    <span className="text-xs text-muted-foreground">
                        {intlPercentMin}%
                    </span>
                </div>
                <Slider
                    defaultValue={[0]}
                    value={[intlPercentMin]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(vals) => setIntlPercentMin(vals[0])}
                    onValueCommit={applyFilters}
                />
            </div>

            <Separator />

            {/* State Filter */}
            <div className="space-y-2">
                <Label>State</Label>
                <Select
                    onValueChange={(val) => {
                        // Reset city when state changes
                        router.push(pathname + "?" + createQueryString({ state: val === "all" ? null : val, city: null }))
                    }}
                    value={selectedState}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map((state) => (
                            <SelectItem key={state} value={state}>
                                {state}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* City Filter */}
            <div className="space-y-2">
                <Label>City</Label>
                <Select
                    onValueChange={(val) => {
                        router.push(pathname + "?" + createQueryString({ city: val === "all" ? null : val }))
                    }}
                    value={searchParams.get("city") || "all"}
                    disabled={filteredCities.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {filteredCities.map((city, idx) => (
                            <SelectItem key={`${city.name}-${idx}`} value={city.name}>
                                {city.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {/* Institution Control */}
            <div className="space-y-2">
                <Label>Institution Type</Label>
                <Select
                    onValueChange={(val) => {
                        router.push(pathname + "?" + createQueryString({ institution_control: val === "all" ? null : val }))
                    }}
                    value={searchParams.get("institution_control") || "all"}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Private not-for-profit">Private</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Institution Level */}
            <div className="space-y-2">
                <Label>Level</Label>
                <Select
                    onValueChange={(val) => {
                        router.push(pathname + "?" + createQueryString({ institution_level: val === "all" ? null : val }))
                    }}
                    value={searchParams.get("institution_level") || "all"}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="4-year">4-year</SelectItem>
                        <SelectItem value="2-year">2-year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
