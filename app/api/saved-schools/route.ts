import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { savedSchoolInsertSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Fetch user's saved schools
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
            percent_admitted_total
          )
        )
      `)
      .eq('user_id', user.id)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved schools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved schools', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('saved_schools')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      data: data || [],
      pagination: {
        total: count || 0,
        offset,
        limit,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Error in saved schools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = savedSchoolInsertSchema.parse(body);

    // Check if institution exists
    const { data: institution } = await supabase
      .from('institutions')
      .select('institution_id, institution_name')
      .eq('institution_id', validatedData.institution_id)
      .single();

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_schools')
      .select('id')
      .eq('user_id', user.id)
      .eq('institution_id', validatedData.institution_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Institution already saved' },
        { status: 409 }
      );
    }

    // Insert saved school
    const { data, error } = await supabase
      .from('saved_schools')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving school:', error);
      return NextResponse.json(
        { error: 'Failed to save school', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, message: 'School saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in save school API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
