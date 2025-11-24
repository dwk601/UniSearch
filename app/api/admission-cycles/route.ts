import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createHash } from 'crypto';

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

    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institution_id');
    const year = searchParams.get('year');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Build query
    let query = supabase
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
          rank
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
      .range(offset, offset + limit - 1);

    if (institutionId) {
      const id = parseInt(institutionId);
      if (!isNaN(id)) {
        query = query.eq('institution_id', id);
      }
    }

    if (year) {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        query = query.eq('year_admissions', yearInt);
      }
    }

    // Order by year (most recent first)
    query = query.order('year_admissions', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching admission cycles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch admission cycles', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('admission_cycles')
      .select('*', { count: 'exact', head: true });

    if (institutionId) {
      const id = parseInt(institutionId);
      if (!isNaN(id)) {
        countQuery = countQuery.eq('institution_id', id);
      }
    }

    if (year) {
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        countQuery = countQuery.eq('year_admissions', yearInt);
      }
    }

    const { count } = await countQuery;

    const responseData = {
      data: data || [],
      pagination: {
        total: count || 0,
        offset,
        limit,
        hasMore: (count || 0) > offset + limit,
      },
    };

    // Generate ETag from response data
    const etag = createHash('sha256')
      .update(JSON.stringify(responseData))
      .digest('hex');

    // Check If-None-Match header for conditional requests
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    return NextResponse.json(responseData, {
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Vary': 'Cookie',
      },
    });
  } catch (error) {
    console.error('Error in admission cycles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
