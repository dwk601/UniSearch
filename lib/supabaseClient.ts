import { createBrowserClient } from '@supabase/ssr';
import type { Institution, Profile, AdmissionRequirement } from './types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create and export the Supabase client for browser usage
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Re-export types from types/database.ts
export type { Institution, Profile, AdmissionRequirement };
