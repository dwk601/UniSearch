import { SupabaseClient } from "@supabase/supabase-js"
import { SearchParams } from "@/lib/validations"

export function buildInstitutionsQuery(supabase: SupabaseClient, params: SearchParams, isCount: boolean = false) {
    // Build query with joins to reference tables
    // For count, we use head: true, so select string is ignored by Supabase usually, but we need to ensure joins are present for filtering.
    // However, Supabase JS client with `head: true` and `count: 'exact'` still respects the filters.
    // The issue is `!inner` joins. If we don't include them in the select string (or .select()), they might not be joined?
    // Actually, we can use `select('*, table!inner(*)', { count: 'exact', head: true })`.

    let selectQuery = isCount ? '*' : `
      institution_id,
      institution_name,
      rank
  `

    // We construct the select string with joins
    // For count, we need to ensure we join the tables we filter on.
    // If we filter on `cities.states.name`, we need `cities!inner(states!inner())`.
    // Even if we don't select fields.

    if (params.locale) {
        selectQuery += `, urbanization_locales!inner(id, description)`
    } else if (!isCount) {
        selectQuery += `, urbanization_locales(id, description)`
    }

    if (params.institution_control) {
        selectQuery += `, institution_controls!inner(id, description)`
    } else if (!isCount) {
        selectQuery += `, institution_controls(id, description)`
    }

    if (params.institution_level) {
        selectQuery += `, institution_levels!inner(id, description)`
    } else if (!isCount) {
        selectQuery += `, institution_levels(id, description)`
    }

    if (params.state) {
        selectQuery += `, cities!inner(id, name, states!inner(id, name))`
    } else if (!isCount) {
        selectQuery += `, cities(id, name, states(id, name))`
    }

    if (params.major) {
        selectQuery += `, popular_majors!inner(major_name)`
    }

    const needsEnglishReqs = params.toefl_score !== undefined ||
        params.ielts_score !== undefined ||
        params.max_tuition_intl !== undefined

    if (needsEnglishReqs) {
        selectQuery += `, admission_cycles!inner(percent_admitted_total, tuition_and_fees, english_requirements!inner(toefl_minimum, ielts_minimum, out_of_state_tuition_intl))`
    } else if (!isCount) {
        selectQuery += `, admission_cycles(percent_admitted_total, tuition_and_fees)`
    }

    if (params.min_intl_percent !== undefined) {
        selectQuery += `, enrollment_stats!inner(percent_nonresident)`
    }

    let query = supabase.from('institutions').select(selectQuery, { count: isCount ? 'exact' : undefined, head: isCount })

    // Apply filters
    if (params.query) {
        query = query.ilike('institution_name', `%${params.query}%`)
    }

    if (params.min_rank) {
        query = query.gte('rank', params.min_rank)
    }

    if (params.max_rank) {
        query = query.lte('rank', params.max_rank)
    }

    if (params.institution_control) {
        query = query.eq('institution_controls.description', params.institution_control)
    }

    if (params.institution_level) {
        query = query.eq('institution_levels.description', params.institution_level)
    }

    if (params.locale) {
        query = query.eq('urbanization_locales.description', params.locale)
    }

    if (params.major) {
        query = query.eq('popular_majors.major_name', params.major)
    }

    if (params.state) {
        query = query.eq('cities.states.name', params.state)
    }

    if (params.city) {
        query = query.eq('cities.name', params.city)
    }

    if (params.toefl_score !== undefined) {
        query = query.lte('admission_cycles.english_requirements.toefl_minimum', params.toefl_score)
    }

    if (params.ielts_score !== undefined) {
        query = query.lte('admission_cycles.english_requirements.ielts_minimum', params.ielts_score)
    }

    if (params.max_tuition_intl !== undefined) {
        query = query.lte('admission_cycles.english_requirements.out_of_state_tuition_intl', params.max_tuition_intl)
    }

    if (params.min_acceptance_rate !== undefined) {
        query = query.gte('admission_cycles.percent_admitted_total', params.min_acceptance_rate)
    }

    if (params.min_intl_percent !== undefined) {
        query = query.gte('enrollment_stats.percent_nonresident', params.min_intl_percent)
    }

    if (params.only_ranked) {
        query = query.not('rank', 'is', null)
    }

    return query
}

export async function getInstitutions(supabase: SupabaseClient, params: SearchParams) {
    let query = buildInstitutionsQuery(supabase, params, false)

    if (params.limit) {
        query = query.range(params.offset, params.offset + params.limit - 1)
    }

    query = query.order('rank', { ascending: true, nullsFirst: false }).order('institution_id', { ascending: true })

    const { data, error } = await query
    if (error) throw error
    return data
}

export async function getInstitutionsCount(supabase: SupabaseClient, params: SearchParams) {
    const query = buildInstitutionsQuery(supabase, params, true)
    const { count, error } = await query
    if (error) throw error
    return count
}

export async function getStates(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('states')
        .select('name')
        .order('name')
    
    if (error) throw error
    return data.map(s => s.name)
}

export async function getLocales(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('urbanization_locales')
        .select('description')
        .order('description')
    
    if (error) throw error
    return data.map(l => l.description)
}

export async function getCities(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('cities')
        .select('name, states!inner(name)')
        .order('name')
    
    if (error) throw error
    // Supabase returns joined data as arrays for one-to-many, but here it seems to treat it as array even for many-to-one sometimes
    // or maybe the type inference is just seeing it as array.
    return data.map(c => ({ 
        name: c.name, 
        state: Array.isArray(c.states) ? c.states[0].name : (c.states as any).name 
    }))
}

export async function getInstitutionById(supabase: SupabaseClient, id: number) {
    const { data, error } = await supabase
        .from('institutions')
        .select(`
            institution_id,
            institution_name,
            rank,
            cities (
                name,
                states (
                    name
                )
            ),
            institution_levels (
                description
            ),
            institution_controls (
                description
            ),
            urbanization_locales (
                description
            ),
            admission_cycles (
                year_admissions,
                tuition_and_fees,
                total_price_on_campus,
                total_price_off_campus,
                applicants_total,
                percent_admitted_total,
                open_admission_policy,
                english_requirements (
                    toefl_minimum,
                    ielts_minimum,
                    out_of_state_tuition_intl
                ),
                admission_requirements (
                    secondary_school_gpa,
                    secondary_school_rank,
                    secondary_school_record,
                    college_prep_program,
                    recommendations,
                    formal_demonstration,
                    work_experience,
                    personal_statement,
                    legacy_status,
                    admission_test_scores,
                    english_proficiency_test,
                    other_test
                ),
                test_scores (
                    sat_erw_25,
                    sat_erw_75,
                    sat_math_25,
                    sat_math_75,
                    act_composite_25,
                    act_composite_75
                ),
                international_documents (
                    document_name
                )
            ),
            enrollment_stats (
                year_enrollment,
                undergraduate_headcount,
                percent_nonresident,
                associate_degree_count,
                bachelor_degree_count,
                percent_nonresident_secondary
            ),
            popular_majors (
                major_name
            )
        `)
        .eq('institution_id', id)
        .single()

    if (error) throw error
    return data
}
