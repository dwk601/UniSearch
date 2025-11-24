import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get unique major names
    // Note: Supabase/PostgREST doesn't support DISTINCT ON directly in the JS client easily for just one column without raw SQL or a view,
    // but we can fetch all and dedup in JS if the list isn't huge, or use .rpc if we had a function.
    // For now, let's try to fetch distinct major_name.
    // Actually, we can use .select('major_name').distinct() if supported, or just fetch all and unique them.
    // Given it's "popular_majors", the table might not be huge.
    
    const { data, error } = await supabase
      .from('popular_majors')
      .select('major_name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Deduplicate
    const uniqueMajors = Array.from(new Set(data.map(item => item.major_name))).sort();

    return NextResponse.json(uniqueMajors);
  } catch (error) {
    console.error('Error fetching popular majors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
