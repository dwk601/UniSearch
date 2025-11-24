import { MagicCard } from "@/components/ui/magic-card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Trophy, DollarSign, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface SchoolCardProps {
    institution: {
        institution_id: number
        institution_name: string
        rank: number | null
        cities: {
            name: string
            states: {
                name: string
            }
        } | null
        admission_cycles: {
            percent_admitted_total: number | null
            tuition_and_fees: number | null
        }[] | null
    }
}

export function SchoolCard({ institution }: SchoolCardProps) {
    const location = institution.cities
        ? `${institution.cities.name}, ${institution.cities.states.name}`
        : "Location N/A"

    const admissionData = institution.admission_cycles?.[0]
    const acceptanceRate = admissionData?.percent_admitted_total
        ? `${Math.round(admissionData.percent_admitted_total)}%`
        : "N/A"

    const tuition = admissionData?.tuition_and_fees
        ? `$${admissionData.tuition_and_fees.toLocaleString()}`
        : "N/A"

    return (
        <MagicCard
            className="h-full cursor-pointer flex flex-col justify-between p-6 shadow-sm hover:shadow-md transition-all duration-200"
            gradientColor="#D9D9D955"
        >
            <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {institution.institution_name}
                    </h3>
                    {institution.rank && (
                        <Badge variant="secondary" className="shrink-0 flex gap-1 items-center">
                            <Trophy className="w-3 h-3" />
                            #{institution.rank}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center text-muted-foreground text-sm gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{location}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 mt-auto">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" /> Acceptance
                    </span>
                    <span className="font-semibold">{acceptanceRate}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Tuition
                    </span>
                    <span className="font-semibold">{tuition}</span>
                </div>
            </div>
        </MagicCard>
    )
}
