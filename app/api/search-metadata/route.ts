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

    // Fetch ranges for international student filters
    const { data: englishData, error: englishError } = await supabase
      .from('english_requirements')
      .select('toefl_minimum, ielts_minimum, out_of_state_tuition_intl');

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollment_stats')
      .select('percent_nonresident');

    if (englishError || enrollmentError) {
      return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }

    // Calculate min/max values
    const toeflScores = englishData.map(d => d.toefl_minimum).filter(v => v !== null) as number[];
    const ieltsScores = englishData.map(d => d.ielts_minimum).filter(v => v !== null) as number[];
    const tuitions = englishData.map(d => d.out_of_state_tuition_intl).filter(v => v !== null) as number[];
    const percents = enrollmentData.map(d => d.percent_nonresident).filter(v => v !== null) as number[];

    const metadata = {
      toefl: {
        min: toeflScores.length ? Math.min(...toeflScores) : 0,
        max: toeflScores.length ? Math.max(...toeflScores) : 120,
      },
      ielts: {
        min: ieltsScores.length ? Math.min(...ieltsScores) : 0,
        max: ieltsScores.length ? Math.max(...ieltsScores) : 9,
      },
      tuition_intl: {
        min: tuitions.length ? Math.min(...tuitions) : 0,
        max: tuitions.length ? Math.max(...tuitions) : 100000,
      },
      percent_intl: {
        min: percents.length ? Math.min(...percents) : 0,
        max: percents.length ? Math.max(...percents) : 100,
      },
    };

    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
