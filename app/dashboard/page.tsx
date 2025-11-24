"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SchoolCard, SchoolCardProps } from "@/components/SchoolCard"
import { Separator } from "@/components/ui/separator"
import { LoadingScreen } from "@/components/LoadingScreen"
import { ShineBorder } from "@/components/ui/shine-border"
import { Check, ChevronsUpDown, Loader2, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { countries } from "@/lib/countries"
import { majors } from "@/lib/majors"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SavedSchool {
  id: number
  institution: SchoolCardProps['institution']
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [country, setCountry] = useState("")
  const [openCountry, setOpenCountry] = useState(false)
  const [intendedMajor, setIntendedMajor] = useState("")
  const [openMajor, setOpenMajor] = useState(false)
  const [savedSchools, setSavedSchools] = useState<SavedSchool[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        if (!isMounted) return
        setLoading(true)
        if (!user) return
  
        // Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
  
        if (!isMounted) return
        if (profileError) throw profileError
  
        if (profile) {
          setFullName(profile.full_name || "")
          setCountry(profile.country || "")
          setIntendedMajor(profile.intended_major || "")
        }
  
        // Fetch Saved Schools
        const { data: schools, error: schoolsError } = await supabase
          .from("saved_schools")
          .select(`
            *,
            institution:institutions (
              institution_id,
              institution_name,
              rank,
              cities (
                name,
                states (
                  name
                )
              ),
              admission_cycles (
                percent_admitted_total,
                tuition_and_fees
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
  
        if (!isMounted) return
        if (schoolsError) throw schoolsError
  
        // Cast the result to match our interface since Supabase types might not perfectly align with our UI types automatically
        setSavedSchools((schools as unknown as SavedSchool[]) || [])
      } catch (error) {
        if (isMounted) console.error("Error fetching data:", error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (authLoading) return

    if (!user) {
      router.push("/login")
    } else {
      fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [user, authLoading, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (!user) return

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          country,
          intended_major: intendedMajor,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  return (
    <div className="container mx-auto min-h-screen space-y-8 p-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your profile and view your saved schools.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* Profile Section */}
        <div className="space-y-6">
          <Card className="relative overflow-hidden border-0 shadow-md">
            <ShineBorder
              className="pointer-events-none absolute inset-0 z-10"
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            />
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Popover open={openCountry} onOpenChange={setOpenCountry}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCountry}
                        className="w-full justify-between"
                      >
                        {country
                          ? countries.find((c) => c.value === country)?.label
                          : "Select country..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((c) => (
                              <CommandItem
                                key={c.value}
                                value={c.value}
                                onSelect={(currentValue) => {
                                  setCountry(currentValue === country ? "" : currentValue)
                                  setOpenCountry(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    country === c.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {c.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intendedMajor">Intended Major</Label>
                  <Popover open={openMajor} onOpenChange={setOpenMajor}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMajor}
                        className="w-full justify-between"
                      >
                        {intendedMajor
                          ? majors.find((major) => major === intendedMajor)
                          : "Select major..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search major..." />
                        <CommandList>
                          <CommandEmpty>No major found.</CommandEmpty>
                          <CommandGroup>
                            {majors.map((major) => (
                              <CommandItem
                                key={major}
                                value={major}
                                onSelect={(currentValue) => {
                                  const originalMajor = majors.find(
                                    (m) => m.toLowerCase() === currentValue.toLowerCase()
                                  )
                                  setIntendedMajor(
                                    originalMajor === intendedMajor
                                      ? ""
                                      : originalMajor || currentValue
                                  )
                                  setOpenMajor(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    intendedMajor === major ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {major}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {message && (
                  <div
                    className={cn(
                      "text-sm font-medium",
                      message.type === "success" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {message.text}
                  </div>
                )}

                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Saved Schools Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Saved Schools</h2>
            <span className="text-sm text-muted-foreground">
              {savedSchools.length} schools saved
            </span>
          </div>
          <Separator />
          
          {savedSchools.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Heart className="h-6 w-6 text-muted-foreground" /> 
              </div>
              <h3 className="mt-4 text-lg font-semibold">No saved schools yet</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Start exploring universities and save your favorites to track them here.
              </p>
              <Button onClick={() => router.push("/schools")}>
                Explore Schools
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
              {savedSchools.map((item) => (
                <div key={item.id} className="relative group">
                   {/* We pass the institution object from the join */}
                  <SchoolCard institution={item.institution} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
