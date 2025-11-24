import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getInstitutionById } from "@/lib/institutions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DotPattern } from "@/components/ui/dot-pattern"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { NumberTicker } from "@/components/ui/number-ticker"
import { AnimatedList } from "@/components/ui/animated-list"
import { SparklesText } from "@/components/ui/sparkles-text"
import { BorderBeam } from "@/components/ui/border-beam"
import { 
    MapPin, 
    Users, 
    DollarSign, 
    GraduationCap, 
    BookOpen, 
    FileText, 
    Globe, 
    CheckCircle2, 
    XCircle,
    Building2,
    School
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SaveSchoolButton } from "@/components/SaveSchoolButton"

export const dynamic = "force-dynamic"

export default async function SchoolDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()
    
    let institution
    try {
        institution = await getInstitutionById(supabase, parseInt(id))
    } catch (error) {
        console.error("Error fetching institution:", error)
        notFound()
    }

    if (!institution) {
        notFound()
    }

    // Helper to safely get single item from array or object
    const getSingle = <T,>(item: T | T[] | null | undefined): T | undefined => (Array.isArray(item) ? item[0] : item) || undefined

    const city = getSingle(institution.cities)
    const state = getSingle(city?.states)
    const control = getSingle(institution.institution_controls)
    const level = getSingle(institution.institution_levels)

    // Get latest admission cycle and enrollment stats
    const admissionCycles = institution.admission_cycles
    const admissionCycle = admissionCycles?.sort((a, b) => b.year_admissions - a.year_admissions)[0]
    
    const enrollmentStatsList = institution.enrollment_stats
    const enrollmentStats = enrollmentStatsList?.sort((a, b) => b.year_enrollment - a.year_enrollment)[0]
    
    const englishReqs = getSingle(admissionCycle?.english_requirements)
    const testScores = getSingle(admissionCycle?.test_scores)
    const admissionReqs = getSingle(admissionCycle?.admission_requirements)

    // Check if saved
    const { data: { user } } = await supabase.auth.getUser()
    let isSaved = false
    if (user) {
        const { data: saved } = await supabase
            .from("saved_schools")
            .select("id")
            .eq("user_id", user.id)
            .eq("institution_id", parseInt(id))
            .single()
        if (saved) isSaved = true
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <DotPattern
                className={cn(
                    "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
                )}
            />
            
            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="mb-6">
                    <Link href="/schools">
                        <Button variant="ghost" size="sm" className="gap-2">
                            ← Back to Schools
                        </Button>
                    </Link>
                </div>

                <BlurFade delay={0.1} inView>
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-4xl font-bold tracking-tight">{institution.institution_name}</h1>
                                    <SaveSchoolButton 
                                        institutionId={institution.institution_id} 
                                        initialIsSaved={isSaved}
                                        className="h-10 w-10"
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{city?.name}, {state?.name}</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4" />
                                    <div className="flex items-center gap-1">
                                        <Building2 className="w-4 h-4" />
                                        <span>{control?.description}</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-4" />
                                    <div className="flex items-center gap-1">
                                        <School className="w-4 h-4" />
                                        <span>{level?.description}</span>
                                    </div>
                                </div>
                            </div>
                            {institution.rank && (
                                <div className="flex items-center gap-2">
                                    <SparklesText className="text-2xl" colors={{ first: "#FFD700", second: "#FFA500" }}>
                                        Rank #{institution.rank}
                                    </SparklesText>
                                </div>
                            )}
                        </div>

                        {/* Key Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MagicCard className="p-6 flex flex-col gap-2 relative overflow-hidden" gradientColor="#D9D9D955">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm font-medium uppercase">Enrollment</span>
                                </div>
                                <div className="text-2xl font-bold">
                                    {enrollmentStats?.undergraduate_headcount ? (
                                        <NumberTicker value={enrollmentStats.undergraduate_headcount} />
                                    ) : "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">Undergraduate Students</div>
                            </MagicCard>

                            <MagicCard className="p-6 flex flex-col gap-2 relative overflow-hidden" gradientColor="#D9D9D955">
                                {admissionCycle?.percent_admitted_total && admissionCycle.percent_admitted_total < 20 && (
                                    <BorderBeam size={250} duration={12} delay={9} />
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium uppercase">Acceptance Rate</span>
                                </div>
                                <div className="text-2xl font-bold">
                                    {admissionCycle?.percent_admitted_total ? (
                                        <>
                                            <NumberTicker value={admissionCycle.percent_admitted_total} decimalPlaces={1} />%
                                        </>
                                    ) : "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {admissionCycle?.applicants_total ? `${admissionCycle.applicants_total.toLocaleString()} Applicants` : "Total Applicants"}
                                </div>
                            </MagicCard>

                            <MagicCard className="p-6 flex flex-col gap-2 relative overflow-hidden" gradientColor="#D9D9D955">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-sm font-medium uppercase">Tuition & Fees</span>
                                </div>
                                <div className="text-2xl font-bold">
                                    {admissionCycle?.tuition_and_fees ? (
                                        <>
                                            $<NumberTicker value={admissionCycle.tuition_and_fees} />
                                        </>
                                    ) : "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">Per Year (Out-of-State)</div>
                            </MagicCard>

                            <MagicCard className="p-6 flex flex-col gap-2 relative overflow-hidden" gradientColor="#D9D9D955">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-medium uppercase">Intl Students</span>
                                </div>
                                <div className="text-2xl font-bold">
                                    {enrollmentStats?.percent_nonresident ? (
                                        <>
                                            <NumberTicker value={enrollmentStats.percent_nonresident} decimalPlaces={1} />%
                                        </>
                                    ) : "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">Non-resident Percentage</div>
                            </MagicCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Admission Requirements */}
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                                        <FileText className="w-6 h-6" />
                                        Admission Requirements
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <RequirementItem label="Secondary School GPA" value={admissionReqs?.secondary_school_gpa} />
                                        <RequirementItem label="School Rank" value={admissionReqs?.secondary_school_rank} />
                                        <RequirementItem label="School Record" value={admissionReqs?.secondary_school_record} />
                                        <RequirementItem label="Recommendations" value={admissionReqs?.recommendations} />
                                        <RequirementItem label="Personal Statement" value={admissionReqs?.personal_statement} />
                                        <RequirementItem label="TOEFL/IELTS" value={admissionReqs?.english_proficiency_test} />
                                    </div>
                                </section>

                                <Separator />

                                {/* Test Scores */}
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                                        <GraduationCap className="w-6 h-6" />
                                        Test Scores (25th-75th Percentile)
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="border rounded-lg p-4 space-y-3">
                                            <h3 className="font-medium text-lg">SAT</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Reading & Writing</span>
                                                    <span className="font-medium">
                                                        {testScores?.sat_erw_25 && testScores?.sat_erw_75 
                                                            ? `${testScores.sat_erw_25} - ${testScores.sat_erw_75}` 
                                                            : "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Math</span>
                                                    <span className="font-medium">
                                                        {testScores?.sat_math_25 && testScores?.sat_math_75 
                                                            ? `${testScores.sat_math_25} - ${testScores.sat_math_75}` 
                                                            : "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border rounded-lg p-4 space-y-3">
                                            <h3 className="font-medium text-lg">ACT</h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Composite</span>
                                                    <span className="font-medium">
                                                        {testScores?.act_composite_25 && testScores?.act_composite_75 
                                                            ? `${testScores.act_composite_25} - ${testScores.act_composite_75}` 
                                                            : "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <Separator />

                                {/* Popular Majors */}
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                                        <BookOpen className="w-6 h-6" />
                                        Popular Majors
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {institution.popular_majors?.map((major, idx) => (
                                            <BlurFade key={idx} delay={0.04 * idx} inView>
                                                <Badge variant="secondary" className="text-sm py-1 px-3 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default">
                                                    {major.major_name}
                                                </Badge>
                                            </BlurFade>
                                        ))}
                                        {(!institution.popular_majors || institution.popular_majors.length === 0) && (
                                            <span className="text-muted-foreground">No major data available</span>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Right Column - International Info */}
                            <div className="space-y-6">
                                <MagicCard className="p-6 space-y-6" gradientColor="#D9D9D955">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        International Info
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-1">English Proficiency</div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span>TOEFL Min</span>
                                                    <Badge variant="secondary">{englishReqs?.toefl_minimum || "N/A"}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span>IELTS Min</span>
                                                    <Badge variant="secondary">{englishReqs?.ielts_minimum || "N/A"}</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-2">Required Documents</div>
                                            <AnimatedList delay={1000}>
                                                {admissionCycle?.international_documents?.map((doc, idx) => (
                                                    <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 mb-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                        <span className="text-sm">{doc.document_name}</span>
                                                    </div>
                                                ))}
                                                {(!admissionCycle?.international_documents || admissionCycle.international_documents.length === 0) && (
                                                    <div className="text-sm text-muted-foreground">No specific document list available</div>
                                                )}
                                            </AnimatedList>
                                        </div>
                                    </div>
                                </MagicCard>
                            </div>
                        </div>
                    </div>
                </BlurFade>
            </div>
        </div>
    )
}

function RequirementItem({ label, value }: { label: string, value?: string | null }) {
    if (!value) return null
    
    const isRequired = value.toLowerCase().includes("required")
    const isConsidered = value.toLowerCase().includes("considered")
    const isNotConsidered = value.toLowerCase().includes("not considered")

    let icon = <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
    let colorClass = "text-muted-foreground"

    if (isRequired) {
        icon = <CheckCircle2 className="w-4 h-4 text-green-600" />
        colorClass = "text-green-600 font-medium"
    } else if (isNotConsidered) {
        icon = <XCircle className="w-4 h-4 text-red-400" />
        colorClass = "text-muted-foreground"
    } else if (isConsidered) {
        icon = <CheckCircle2 className="w-4 h-4 text-blue-500" />
        colorClass = "text-blue-600"
    }

    return (
        <div className="flex items-start gap-2 p-3 rounded-lg border bg-card/50">
            <div className="mt-0.5">{icon}</div>
            <div>
                <div className="text-sm font-medium">{label}</div>
                <div className={cn("text-xs", colorClass)}>{value}</div>
            </div>
        </div>
    )
}
