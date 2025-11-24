import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    const admissionCycleId = parseInt(id);

    if (isNaN(admissionCycleId)) {
      return NextResponse.json(
        { error: 'Invalid admission cycle ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('admission_cycles')
      .select(`
        id,
        institution_id,
        year_admissions,
        tuition_and_fees,
        total_price_on_campus,
        total_price_off_campus,
        percent_admitted_total,
        applicants_total,
        open_admission_policy,
        institutions (
          institution_id,
          institution_name,
          rank,
          cities (
            name,
            states (
              name
            )
          ),
          enrollment_stats (
            id,
            year_enrollment,
            undergraduate_headcount,
            percent_nonresident,
            associate_degree_count,
            bachelor_degree_count,
            percent_nonresident_secondary
          )
        ),
        admission_requirements (
          id,
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
          id,
          sat_erw_25,
          sat_erw_75,
          sat_math_25,
          sat_math_75,
          act_composite_25,
          act_composite_75
        ),
        english_requirements (
          id,
          out_of_state_tuition_intl,
          toefl_minimum,
          toefl_section_requirements,
          ielts_minimum,
          ielts_section_requirements,
          english_exemptions
        ),
        international_documents (
          id,
          document_name
        )
      `)
      .eq('id', admissionCycleId)
      .single();

    if (error) {
      console.error('Error fetching admission cycle:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Admission cycle not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch admission cycle', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in admission cycle API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
