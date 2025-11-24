'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleSavedSchool(institutionId: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from("saved_schools")
    .select("id")
    .eq("user_id", user.id)
    .eq("institution_id", institutionId)
    .single()

  if (existing) {
    // Remove
    const { error } = await supabase
      .from("saved_schools")
      .delete()
      .eq("id", existing.id)

    if (error) throw error
    
    revalidatePath("/dashboard")
    revalidatePath("/schools")
    revalidatePath(`/schools/${institutionId}`)
    return { saved: false }
  } else {
    // Check limit
    const { count } = await supabase
      .from("saved_schools")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)

    if (count !== null && count >= 20) { // Limit of 20
      throw new Error("Limit reached. You can only save up to 20 schools.")
    }

    // Add
    const { error } = await supabase
      .from("saved_schools")
      .insert({
        user_id: user.id,
        institution_id: institutionId
      })

    if (error) throw error

    revalidatePath("/dashboard")
    revalidatePath("/schools")
    revalidatePath(`/schools/${institutionId}`)
    return { saved: true }
  }
}
