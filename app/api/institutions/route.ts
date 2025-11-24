import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchParamsSchema } from '@/lib/validations';
import { createHash } from 'crypto';
import { aj } from "@/lib/arcjet";

import { getInstitutions, getInstitutionsCount } from '@/lib/institutions';

export async function GET(request: NextRequest) {
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = await createClient();

    // Parse and validate search parameters
    const { searchParams } = new URL(request.url);
    const params = {
      query: searchParams.get('query') || undefined,
      state: searchParams.get('state') || undefined,
      city: searchParams.get('city') || undefined,
      institution_control: searchParams.get('institution_control') || undefined,
      institution_level: searchParams.get('institution_level') || undefined,
      locale: searchParams.get('locale') || undefined,
      major: searchParams.get('major') || undefined,
      min_rank: searchParams.get('min_rank') ? parseInt(searchParams.get('min_rank')!) : undefined,
      max_rank: searchParams.get('max_rank') ? parseInt(searchParams.get('max_rank')!) : undefined,
      toefl_score: searchParams.get('toefl_score') ? parseInt(searchParams.get('toefl_score')!) : undefined,
      ielts_score: searchParams.get('ielts_score') ? parseFloat(searchParams.get('ielts_score')!) : undefined,
      max_tuition_intl: searchParams.get('max_tuition_intl') ? parseInt(searchParams.get('max_tuition_intl')!) : undefined,
      min_acceptance_rate: searchParams.get('min_acceptance_rate') ? parseInt(searchParams.get('min_acceptance_rate')!) : undefined,
      min_intl_percent: searchParams.get('min_intl_percent') ? parseFloat(searchParams.get('min_intl_percent')!) : undefined,
      only_ranked: searchParams.get('only_ranked') === 'true',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const validatedParams = searchParamsSchema.parse(params);

    const data = await getInstitutions(supabase, validatedParams);
    const totalCount = await getInstitutionsCount(supabase, validatedParams);

    const responseData = {
      data: data || [],
      pagination: {
        total: totalCount || 0,
        offset: validatedParams.offset,
        limit: validatedParams.limit || 20, // Default for display if undefined
        hasMore: validatedParams.limit ? (totalCount || 0) > validatedParams.offset + validatedParams.limit : false,
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
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    return NextResponse.json(responseData, {
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Vary': 'Cookie',
      },
    });
  } catch (error: unknown) {
    console.error('Error in institutions API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse and validate request body
    const body = await request.json();
    const { institutionInsertSchema } = await import('@/lib/validations');
    const validatedData = institutionInsertSchema.parse(body);

    // Insert institution
    const { data, error } = await supabase
      .from('institutions')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating institution:', error);
      return NextResponse.json(
        { error: 'Failed to create institution', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, message: 'Institution created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in create institution API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
