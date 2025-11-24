// Database type definitions for Supabase tables based on SCHEMA.md

export type AdminUser = {
  id: number;
  user_id: string;
  role: 'admin' | 'super_admin';
  is_active: boolean | null;
  permissions: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
};

export type AdmissionCycle = {
  id: number;
  institution_id: number | null;
  year_admissions: number;
  tuition_and_fees: number | null;
  total_price_on_campus: number | null;
  total_price_off_campus: number | null;
  applicants_total: number | null;
  percent_admitted_total: number | null;
  open_admission_policy: string | null;
  admission_requirements?: AdmissionRequirement[] | null;
  english_requirements?: EnglishRequirement[] | null;
  test_scores?: TestScore[] | null;
  international_documents?: InternationalDocument[] | null;
};

export type AdmissionRequirement = {
  id: number;
  admission_cycle_id: number | null;
  secondary_school_gpa: string | null;
  secondary_school_rank: string | null;
  secondary_school_record: string | null;
  college_prep_program: string | null;
  recommendations: string | null;
  formal_demonstration: string | null;
  work_experience: string | null;
  personal_statement: string | null;
  legacy_status: string | null;
  admission_test_scores: string | null;
  english_proficiency_test: string | null;
  other_test: string | null;
};

export type City = {
  id: number;
  name: string;
  state_id: number | null;
};

export type EnglishRequirement = {
  id: number;
  admission_cycle_id: number | null;
  out_of_state_tuition_intl: number | null;
  toefl_minimum: number | null;
  toefl_section_requirements: string | null;
  ielts_minimum: number | null;
  ielts_section_requirements: string | null;
  english_exemptions: string | null;
};

export type EnrollmentStat = {
  id: number;
  institution_id: number | null;
  year_enrollment: number;
  undergraduate_headcount: number | null;
  percent_nonresident: number | null;
  associate_degree_count: number | null;
  bachelor_degree_count: number | null;
  percent_nonresident_secondary: number | null;
};

export type InstitutionControl = {
  id: number;
  description: string;
};

export type InstitutionLevel = {
  id: number;
  description: string;
};

export type Institution = {
  institution_id: number;
  institution_name: string;
  rank: number | null;
  city_id: number | null;
  level_id: number | null;
  control_id: number | null;
  locale_id: number | null;
};

export type InternationalDocument = {
  id: number;
  admission_cycle_id: number | null;
  document_name: string;
};

export type PopularMajor = {
  id: number;
  institution_id: number | null;
  major_name: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  country: string | null;
  intended_major: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SavedSchool = {
  id: number;
  user_id: string;
  institution_id: number;
  notes: string | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
};

export type State = {
  id: number;
  name: string;
};

export type TestScore = {
  id: number;
  admission_cycle_id: number | null;
  sat_erw_25: number | null;
  sat_erw_75: number | null;
  sat_math_25: number | null;
  sat_math_75: number | null;
  act_composite_25: number | null;
  act_composite_75: number | null;
};

export type UrbanizationLocale = {
  id: number;
  description: string;
};

// Composite types for UI

export type InstitutionWithDetails = Institution & {
  cities: (City & { states: State | null }) | null;
  institution_levels: InstitutionLevel | null;
  institution_controls: InstitutionControl | null;
  urbanization_locales: UrbanizationLocale | null;
  admission_cycles?: AdmissionCycle[] | null;
  enrollment_stats?: EnrollmentStat[] | null;
  popular_majors?: PopularMajor[] | null;
};

export type SavedSchoolWithDetails = SavedSchool & {
  institutions: InstitutionWithDetails | null;
};

export type InstitutionSummary = {
  institution_id: number;
  institution_name: string;
  rank: number | null;
  cities: {
    name: string;
    states: {
      name: string;
    } | null;
  } | null;
  admission_cycles: {
    percent_admitted_total: number | null;
    tuition_and_fees: number | null;
  }[] | null;
};
