import { z } from 'zod';

// =====================================================
// Profile Validation Schemas
// =====================================================

export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1, 'Full name is required').max(255).optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  country: z.string().max(100).optional(),
  intended_major: z.string().max(255).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const profileInsertSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255).optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  country: z.string().max(100).optional(),
  intended_major: z.string().max(255).optional(),
});

export const profileUpdateSchema = profileInsertSchema.partial();

// =====================================================
// Institution Validation Schemas
// =====================================================

export const institutionSchema = z.object({
  institution_id: z.number().int().positive(),
  institution_name: z.string().min(1, 'Institution name is required'),
  rank: z.number().int().positive().optional().nullable(),
  city_id: z.number().int().positive().optional().nullable(),
  level_id: z.number().int().positive().optional().nullable(),
  control_id: z.number().int().positive().optional().nullable(),
  locale_id: z.number().int().positive().optional().nullable(),
});

export const institutionInsertSchema = z.object({
  institution_name: z.string().min(1, 'Institution name is required').max(500),
  rank: z.number().int().positive().optional().nullable(),
  city_id: z.number().int().positive().optional().nullable(),
  level_id: z.number().int().positive().optional().nullable(),
  control_id: z.number().int().positive().optional().nullable(),
  locale_id: z.number().int().positive().optional().nullable(),
});

export const institutionUpdateSchema = institutionInsertSchema.partial();

// =====================================================
// Admission Cycle Validation Schemas
// =====================================================

export const admissionCycleSchema = z.object({
  id: z.number().int().positive(),
  institution_id: z.number().int().positive().nullable(),
  year_admissions: z.number().int().min(1900).max(2100),
  tuition_and_fees: z.number().nonnegative().optional().nullable(),
  total_price_on_campus: z.number().nonnegative().optional().nullable(),
  total_price_off_campus: z.number().nonnegative().optional().nullable(),
  applicants_total: z.number().int().nonnegative().optional().nullable(),
  percent_admitted_total: z.number().min(0).max(100).optional().nullable(),
  open_admission_policy: z.string().optional().nullable(),
});

export const admissionCycleInsertSchema = z.object({
  institution_id: z.number().int().positive().nullable(),
  year_admissions: z.number().int().min(1900).max(2100),
  tuition_and_fees: z.number().nonnegative().optional().nullable(),
  total_price_on_campus: z.number().nonnegative().optional().nullable(),
  total_price_off_campus: z.number().nonnegative().optional().nullable(),
  applicants_total: z.number().int().nonnegative().optional().nullable(),
  percent_admitted_total: z.number().min(0).max(100).optional().nullable(),
  open_admission_policy: z.string().optional().nullable(),
});

export const admissionCycleUpdateSchema = admissionCycleInsertSchema.partial();

// =====================================================
// Admission Requirements Validation Schemas
// =====================================================

export const admissionRequirementsSchema = z.object({
  id: z.number().int().positive(),
  admission_cycle_id: z.number().int().positive().nullable(),
  secondary_school_gpa: z.string().optional().nullable(),
  secondary_school_rank: z.string().optional().nullable(),
  secondary_school_record: z.string().optional().nullable(),
  college_prep_program: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  formal_demonstration: z.string().optional().nullable(),
  work_experience: z.string().optional().nullable(),
  personal_statement: z.string().optional().nullable(),
  legacy_status: z.string().optional().nullable(),
  admission_test_scores: z.string().optional().nullable(),
  english_proficiency_test: z.string().optional().nullable(),
  other_test: z.string().optional().nullable(),
});

export const admissionRequirementsInsertSchema = z.object({
  admission_cycle_id: z.number().int().positive().nullable(),
  secondary_school_gpa: z.string().optional().nullable(),
  secondary_school_rank: z.string().optional().nullable(),
  secondary_school_record: z.string().optional().nullable(),
  college_prep_program: z.string().optional().nullable(),
  recommendations: z.string().optional().nullable(),
  formal_demonstration: z.string().optional().nullable(),
  work_experience: z.string().optional().nullable(),
  personal_statement: z.string().optional().nullable(),
  legacy_status: z.string().optional().nullable(),
  admission_test_scores: z.string().optional().nullable(),
  english_proficiency_test: z.string().optional().nullable(),
  other_test: z.string().optional().nullable(),
});

export const admissionRequirementsUpdateSchema = admissionRequirementsInsertSchema.partial();

// =====================================================
// Test Scores Validation Schemas
// =====================================================

export const testScoresSchema = z.object({
  id: z.number().int().positive(),
  admission_cycle_id: z.number().int().positive().nullable(),
  sat_erw_25: z.number().int().min(200).max(800).optional().nullable(),
  sat_erw_75: z.number().int().min(200).max(800).optional().nullable(),
  sat_math_25: z.number().int().min(200).max(800).optional().nullable(),
  sat_math_75: z.number().int().min(200).max(800).optional().nullable(),
  act_composite_25: z.number().int().min(1).max(36).optional().nullable(),
  act_composite_75: z.number().int().min(1).max(36).optional().nullable(),
});

export const testScoresInsertSchema = z.object({
  admission_cycle_id: z.number().int().positive().nullable(),
  sat_erw_25: z.number().int().min(200).max(800).optional().nullable(),
  sat_erw_75: z.number().int().min(200).max(800).optional().nullable(),
  sat_math_25: z.number().int().min(200).max(800).optional().nullable(),
  sat_math_75: z.number().int().min(200).max(800).optional().nullable(),
  act_composite_25: z.number().int().min(1).max(36).optional().nullable(),
  act_composite_75: z.number().int().min(1).max(36).optional().nullable(),
});

export const testScoresUpdateSchema = testScoresInsertSchema.partial();

// =====================================================
// English Requirements Validation Schemas
// =====================================================

export const englishRequirementsSchema = z.object({
  id: z.number().int().positive(),
  admission_cycle_id: z.number().int().positive().nullable(),
  out_of_state_tuition_intl: z.number().nonnegative().optional().nullable(),
  toefl_minimum: z.number().int().min(0).max(120).optional().nullable(),
  toefl_section_requirements: z.string().optional().nullable(),
  ielts_minimum: z.number().min(0).max(9).optional().nullable(),
  ielts_section_requirements: z.string().optional().nullable(),
  english_exemptions: z.string().optional().nullable(),
});

export const englishRequirementsInsertSchema = z.object({
  admission_cycle_id: z.number().int().positive().nullable(),
  out_of_state_tuition_intl: z.number().nonnegative().optional().nullable(),
  toefl_minimum: z.number().int().min(0).max(120).optional().nullable(),
  toefl_section_requirements: z.string().optional().nullable(),
  ielts_minimum: z.number().min(0).max(9).optional().nullable(),
  ielts_section_requirements: z.string().optional().nullable(),
  english_exemptions: z.string().optional().nullable(),
});

export const englishRequirementsUpdateSchema = englishRequirementsInsertSchema.partial();

// =====================================================
// Saved Schools Validation Schemas
// =====================================================

export const savedSchoolSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.string().uuid(),
  institution_id: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const savedSchoolInsertSchema = z.object({
  institution_id: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const savedSchoolUpdateSchema = z.object({
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

// =====================================================
// Enrollment Stats Validation Schemas
// =====================================================

export const enrollmentStatsSchema = z.object({
  id: z.number().int().positive(),
  institution_id: z.number().int().positive().nullable(),
  year_enrollment: z.number().int().min(1900).max(2100),
  undergraduate_headcount: z.number().int().nonnegative().optional().nullable(),
  percent_nonresident: z.number().min(0).max(100).optional().nullable(),
  associate_degree_count: z.number().int().nonnegative().optional().nullable(),
  bachelor_degree_count: z.number().int().nonnegative().optional().nullable(),
  percent_nonresident_secondary: z.number().min(0).max(100).optional().nullable(),
});

export const enrollmentStatsInsertSchema = z.object({
  institution_id: z.number().int().positive().nullable(),
  year_enrollment: z.number().int().min(1900).max(2100),
  undergraduate_headcount: z.number().int().nonnegative().optional().nullable(),
  percent_nonresident: z.number().min(0).max(100).optional().nullable(),
  associate_degree_count: z.number().int().nonnegative().optional().nullable(),
  bachelor_degree_count: z.number().int().nonnegative().optional().nullable(),
  percent_nonresident_secondary: z.number().min(0).max(100).optional().nullable(),
});

export const enrollmentStatsUpdateSchema = enrollmentStatsInsertSchema.partial();

// =====================================================
// Popular Majors Validation Schemas
// =====================================================

export const popularMajorSchema = z.object({
  id: z.number().int().positive(),
  institution_id: z.number().int().positive().nullable(),
  major_name: z.string().min(1, 'Major name is required').max(255),
});

export const popularMajorInsertSchema = z.object({
  institution_id: z.number().int().positive().nullable(),
  major_name: z.string().min(1, 'Major name is required').max(255),
});

export const popularMajorUpdateSchema = popularMajorInsertSchema.partial();

// =====================================================
// Search and Filter Validation Schemas
// =====================================================

export const searchParamsSchema = z.object({
  query: z.string().max(255).optional(),
  state: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  institution_control: z.string().max(50).optional(),
  institution_level: z.string().max(50).optional(),
  locale: z.string().max(100).optional(),
  major: z.string().max(255).optional(),
  min_rank: z.number().int().positive().optional(),
  max_rank: z.number().int().positive().optional(),
  toefl_score: z.number().int().min(0).max(120).optional(),
  ielts_score: z.number().min(0).max(9).optional(),
  max_tuition_intl: z.number().nonnegative().optional(),
  min_acceptance_rate: z.number().min(0).max(100).optional(),
  min_intl_percent: z.number().min(0).max(100).optional(),
  only_ranked: z.boolean().optional(),
  sort: z.enum(['rank_asc', 'rank_desc', 'name_asc', 'name_desc']).optional(),
  limit: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).default(0),
});

export type Profile = z.infer<typeof profileSchema>;
export type Institution = z.infer<typeof institutionSchema>;
export type AdmissionCycle = z.infer<typeof admissionCycleSchema>;
export type AdmissionRequirements = z.infer<typeof admissionRequirementsSchema>;
export type TestScores = z.infer<typeof testScoresSchema>;
export type EnglishRequirements = z.infer<typeof englishRequirementsSchema>;
export type SavedSchool = z.infer<typeof savedSchoolSchema>;
export type EnrollmentStats = z.infer<typeof enrollmentStatsSchema>;
export type PopularMajor = z.infer<typeof popularMajorSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
