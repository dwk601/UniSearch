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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const savedSchoolId = parseInt(id);

    if (isNaN(savedSchoolId)) {
      return NextResponse.json(
        { error: 'Invalid saved school ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('saved_schools')
      .select(`
        id,
        user_id,
        institution_id,
        notes,
        tags,
        created_at,
        updated_at,
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
          institution_controls (
            description
          ),
          admission_cycles (
            id,
            year_admissions,
            tuition_and_fees,
            total_price_on_campus,
            percent_admitted_total,
            admission_requirements (
              id,
              secondary_school_gpa,
              test_optional
            ),
            test_scores (
              id,
              sat_math_25,
              sat_math_75,
              act_composite_25,
              act_composite_75
            ),
            english_requirements (
              id,
              toefl_minimum,
              ielts_minimum
            )
          )
        )
      `)
      .eq('id', savedSchoolId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching saved school:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Saved school not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch saved school', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in saved school API:', error);
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

    const savedSchoolId = parseInt(id);

    if (isNaN(savedSchoolId)) {
      return NextResponse.json(
        { error: 'Invalid saved school ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update saved school (only notes and tags are updatable)
    const { data, error } = await supabase
      .from('saved_schools')
      .update({
        notes: body.notes,
        tags: body.tags,
      })
      .eq('id', savedSchoolId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating saved school:', error);
      return NextResponse.json(
        { error: 'Failed to update saved school', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, message: 'Saved school updated successfully' }
    );
  } catch (error) {
    console.error('Error in update saved school API:', error);
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

    const savedSchoolId = parseInt(id);

    if (isNaN(savedSchoolId)) {
      return NextResponse.json(
        { error: 'Invalid saved school ID' },
        { status: 400 }
      );
    }

    // Delete saved school
    const { error } = await supabase
      .from('saved_schools')
      .delete()
      .eq('id', savedSchoolId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting saved school:', error);
      return NextResponse.json(
        { error: 'Failed to delete saved school', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Saved school deleted successfully' }
    );
  } catch (error) {
    console.error('Error in delete saved school API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
