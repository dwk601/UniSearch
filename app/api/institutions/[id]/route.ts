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

    const institutionId = parseInt(id);

    if (isNaN(institutionId)) {
      return NextResponse.json(
        { error: 'Invalid institution ID' },
        { status: 400 }
      );
    }

    // Fetch institution with all related data
    const { data, error } = await supabase
      .from('institutions')
      .select(`
        institution_id,
        institution_name,
        rank,
        cities (
          id,
          name,
          states (
            id,
            name
          )
        ),
        institution_levels (
          id,
          description
        ),
        institution_controls (
          id,
          description
        ),
        urbanization_locales (
          id,
          description
        ),
        admission_cycles (
          id,
          year_admissions,
          tuition_and_fees,
          total_price_on_campus,
          total_price_off_campus,
          percent_admitted_total,
          applicants_total,
          open_admission_policy,
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
        ),
        enrollment_stats (
          id,
          year_enrollment,
          undergraduate_headcount,
          percent_nonresident,
          associate_degree_count,
          bachelor_degree_count,
          percent_nonresident_secondary
        ),
        popular_majors (
          id,
          major_name
        )
      `)
      .eq('institution_id', institutionId)
      .single();

    if (error) {
      console.error('Error fetching institution:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Institution not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch institution', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in institution API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const institutionId = parseInt(id);

    if (isNaN(institutionId)) {
      return NextResponse.json(
        { error: 'Invalid institution ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { institutionInsertSchema } = await import('@/lib/validations');
    const validatedData = institutionInsertSchema.parse(body);

    // Update institution
    const { data, error } = await supabase
      .from('institutions')
      .update(validatedData)
      .eq('institution_id', institutionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating institution:', error);
      return NextResponse.json(
        { error: 'Failed to update institution', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, message: 'Institution updated successfully' }
    );
  } catch (error) {
    console.error('Error in update institution API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const institutionId = parseInt(id);

    if (isNaN(institutionId)) {
      return NextResponse.json(
        { error: 'Invalid institution ID' },
        { status: 400 }
      );
    }

    // Delete institution (cascade will handle related records)
    const { error } = await supabase
      .from('institutions')
      .delete()
      .eq('institution_id', institutionId);

    if (error) {
      console.error('Error deleting institution:', error);
      return NextResponse.json(
        { error: 'Failed to delete institution', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Institution deleted successfully' }
    );
  } catch (error) {
    console.error('Error in delete institution API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
