# University ETL Database Schema (3NF)

## Overview

This document describes the normalized 3NF (Third Normal Form) database schema for the University ETL project, loaded into Supabase. The schema separates university admission data into dimension and fact tables to eliminate redundancy and maintain data integrity.

## Schema Diagram

```
┌─────────────────┐
│    states       │
├─────────────────┤
│ id (PK)         │
│ name (UNIQUE)   │
└─────────────────┘
         ▲
         │
┌─────────────────┐
│    cities       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ state_id (FK)   │
└─────────────────┘
         ▲
         │
┌──────────────────────────┐
│     institutions         │
├──────────────────────────┤
│ institution_id (PK)      │◄───┐
│ institution_name         │    │
│ rank                     │    │
│ city_id (FK)             │    │
│ level_id (FK)            │    │
│ control_id (FK)          │    │
│ locale_id (FK)           │    │
└──────────────────────────┘    │
         ▲                       │
         │                       │
    ┌────┴────┐                 │
    │         │                 │
    ▼         ▼                 │
┌─────────────────┐  ┌────────────────────┐
│ enrollment_stats│  │  admission_cycles  │
├─────────────────┤  ├────────────────────┤
│ id (PK)         │  │ id (PK)            │
│ institution_id  │  │ institution_id (FK)│
│ year_enrollment │  │ year_admissions    │
│ ...             │  │ tuition_and_fees   │
└─────────────────┘  │ ...                │
                     └────────────────────┘
                              ▲
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
         ┌──────────────────┐  ┌─────────────────────┐
         │   test_scores    │  │ admission_requirements│
         ├──────────────────┤  ├─────────────────────┤
         │ id (PK)          │  │ id (PK)             │
         │ admission_cycle_ │  │ admission_cycle_id  │
         │   id (FK)        │  │ ...                 │
         │ sat_erw_25       │  └─────────────────────┘
         │ ...              │
         └──────────────────┘
```

## Database Statistics

- **Total University Records**: 2,386 institutions
- **Normalized Tables**: 17 tables total
- **University Data Tables**: 14 tables
  - **Dimension Tables**: 5
  - **Fact Tables**: 9
- **User Management Tables**: 3 tables
  - **profiles**: User profile data
  - **saved_schools**: User's saved institutions
  - **admin_users**: Admin role assignments
- **University Data Details**:
  - **States**: 58 unique states
  - **Cities**: 1,626 unique cities
  - **International Documents**: 12,073 entries
  - **Popular Majors**: 13,811 entries

## Table Definitions

### Dimension Tables

#### `states`
Stores unique U.S. states.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing state ID |
| name | TEXT | UNIQUE, NOT NULL | State name (e.g., "Alabama", "California") |

**Sample Data:**
```sql
SELECT * FROM states LIMIT 3;
-- id | name
-- 1  | Alabama
-- 2  | Alaska
-- 3  | Arizona
```

---

#### `institution_levels`
Classification of institution degree levels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing level ID |
| description | TEXT | UNIQUE, NOT NULL | Level description |

**Possible Values:**
- "Four or more years"
- "At least 2 but less than 4 years"

---

#### `institution_controls`
Type of institutional control (public/private).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing control ID |
| description | TEXT | UNIQUE, NOT NULL | Control type description |

**Possible Values:**
- "Public"
- "Private not-for-profit"
- "Private for-profit"

---

#### `urbanization_locales`
Urban-centric locale classifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing locale ID |
| description | TEXT | UNIQUE, NOT NULL | Urbanization level |

**Sample Values:**
- "City: Large"
- "City: Midsize"
- "Suburb: Large"
- "Town: Distant"
- "Rural: Remote"

---

#### `cities`
Geographic city information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing city ID |
| name | TEXT | NOT NULL | City name |
| state_id | INTEGER | FOREIGN KEY → states(id) | Reference to state |
| | | UNIQUE (name, state_id) | Prevents duplicate city/state pairs |

**Sample Query:**
```sql
SELECT c.name, s.name AS state
FROM cities c
JOIN states s ON c.state_id = s.id
WHERE s.name = 'Alabama'
LIMIT 5;
```

---

### Fact Tables

#### `institutions`
Core university/college information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| institution_id | BIGINT | PRIMARY KEY | IPEDS UnitID |
| institution_name | TEXT | NOT NULL | Official institution name |
| rank | INTEGER | NULL | U.S. News ranking (if available) |
| city_id | INTEGER | FOREIGN KEY → cities(id) | Location reference |
| level_id | INTEGER | FOREIGN KEY → institution_levels(id) | Degree level |
| control_id | INTEGER | FOREIGN KEY → institution_controls(id) | Public/private status |
| locale_id | INTEGER | FOREIGN KEY → urbanization_locales(id) | Urban classification |

**Key Points:**
- `institution_id` corresponds to the federal IPEDS UnitID
- `rank` is NULL for unranked institutions
- Use JOINs to resolve dimensional foreign keys

**Sample Query:**
```sql
SELECT 
    i.institution_name,
    i.rank,
    c.name AS city,
    s.name AS state,
    il.description AS level,
    ic.description AS control_type
FROM institutions i
LEFT JOIN cities c ON i.city_id = c.id
LEFT JOIN states s ON c.state_id = s.id
LEFT JOIN institution_levels il ON i.level_id = il.id
LEFT JOIN institution_controls ic ON i.control_id = ic.id
WHERE i.rank IS NOT NULL
ORDER BY i.rank
LIMIT 10;
```

---

#### `enrollment_stats`
Annual enrollment statistics per institution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing row ID |
| institution_id | BIGINT | FOREIGN KEY → institutions(institution_id), ON DELETE CASCADE | Institution reference |
| year_enrollment | SMALLINT | NOT NULL | Enrollment year (e.g., 2024) |
| undergraduate_headcount | INTEGER | NULL | Total undergrad headcount |
| percent_nonresident | NUMERIC(6,2) | NULL | % of U.S. nonresidents |
| associate_degree_count | INTEGER | NULL | Associate degrees awarded |
| bachelor_degree_count | INTEGER | NULL | Bachelor degrees awarded |
| percent_nonresident_secondary | NUMERIC(6,2) | NULL | Secondary nonresident % |
| | | UNIQUE (institution_id, year_enrollment) | One record per institution per year |

**Sample Query:**
```sql
SELECT 
    i.institution_name,
    es.year_enrollment,
    es.undergraduate_headcount,
    es.bachelor_degree_count
FROM enrollment_stats es
JOIN institutions i ON es.institution_id = i.institution_id
WHERE es.year_enrollment = 2024
ORDER BY es.undergraduate_headcount DESC
LIMIT 10;
```

---

#### `admission_cycles`
Admissions data per institution per cycle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing admission cycle ID |
| institution_id | BIGINT | FOREIGN KEY → institutions(institution_id), ON DELETE CASCADE | Institution reference |
| year_admissions | SMALLINT | NOT NULL | Admission year (e.g., 2023) |
| tuition_and_fees | NUMERIC(12,2) | NULL | Annual tuition + fees (USD) |
| total_price_on_campus | NUMERIC(12,2) | NULL | Total on-campus cost (out-of-state) |
| total_price_off_campus | NUMERIC(12,2) | NULL | Total off-campus cost (out-of-state) |
| applicants_total | INTEGER | NULL | Total applicants |
| percent_admitted_total | NUMERIC(6,2) | NULL | Acceptance rate (%) |
| open_admission_policy | TEXT | NULL | "Yes", "No", or NULL |
| | | UNIQUE (institution_id, year_admissions) | One cycle per institution per year |

**Sample Query:**
```sql
SELECT 
    i.institution_name,
    ac.year_admissions,
    ac.applicants_total,
    ac.percent_admitted_total AS acceptance_rate,
    ac.tuition_and_fees
FROM admission_cycles ac
JOIN institutions i ON ac.institution_id = i.institution_id
WHERE ac.percent_admitted_total < 20
ORDER BY ac.percent_admitted_total
LIMIT 10;
```

---

#### `test_scores`
Standardized test score ranges (SAT/ACT) per admission cycle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing score ID |
| admission_cycle_id | BIGINT | FOREIGN KEY → admission_cycles(id), ON DELETE CASCADE | Admission cycle reference |
| sat_erw_25 | SMALLINT | NULL | SAT Reading/Writing 25th percentile |
| sat_erw_75 | SMALLINT | NULL | SAT Reading/Writing 75th percentile |
| sat_math_25 | SMALLINT | NULL | SAT Math 25th percentile |
| sat_math_75 | SMALLINT | NULL | SAT Math 75th percentile |
| act_composite_25 | SMALLINT | NULL | ACT Composite 25th percentile |
| act_composite_75 | SMALLINT | NULL | ACT Composite 75th percentile |

**Sample Query:**
```sql
SELECT 
    i.institution_name,
    ts.sat_erw_25,
    ts.sat_erw_75,
    ts.sat_math_25,
    ts.sat_math_75
FROM test_scores ts
JOIN admission_cycles ac ON ts.admission_cycle_id = ac.id
JOIN institutions i ON ac.institution_id = i.institution_id
WHERE ts.sat_erw_25 >= 700
ORDER BY ts.sat_erw_25 DESC;
```

---

#### `admission_requirements`
Qualitative admission criteria per cycle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing requirement ID |
| admission_cycle_id | BIGINT | FOREIGN KEY → admission_cycles(id), ON DELETE CASCADE | Admission cycle reference |
| secondary_school_gpa | TEXT | NULL | GPA requirement status |
| secondary_school_rank | TEXT | NULL | Class rank requirement |
| secondary_school_record | TEXT | NULL | Transcript requirement |
| college_prep_program | TEXT | NULL | College prep completion requirement |
| recommendations | TEXT | NULL | Letter of recommendation policy |
| formal_demonstration | TEXT | NULL | Competency demonstration policy |
| work_experience | TEXT | NULL | Work experience consideration |
| personal_statement | TEXT | NULL | Essay requirement |
| legacy_status | TEXT | NULL | Legacy consideration |
| admission_test_scores | TEXT | NULL | SAT/ACT policy |
| english_proficiency_test | TEXT | NULL | TOEFL/IELTS policy |
| other_test | TEXT | NULL | Other test requirements |

**Possible Values (Example):**
- "Required to be considered for admission"
- "Not required for admission, but considered if submitted"
- "Not considered for admission, even if submitted"
- "Not required for admission, but considered if submitted (Test Optional)"

---

#### `english_requirements`
English proficiency and international student financial data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing requirement ID |
| admission_cycle_id | BIGINT | FOREIGN KEY → admission_cycles(id), ON DELETE CASCADE | Admission cycle reference |
| out_of_state_tuition_intl | NUMERIC(12,2) | NULL | International student tuition (USD) |
| toefl_minimum | SMALLINT | NULL | Minimum TOEFL iBT score |
| toefl_section_requirements | TEXT | NULL | TOEFL section-specific minimums |
| ielts_minimum | NUMERIC(4,1) | NULL | Minimum IELTS band score |
| ielts_section_requirements | TEXT | NULL | IELTS band-specific minimums |
| english_exemptions | TEXT | NULL | Exemption criteria description |

**Sample Query:**
```sql
SELECT 
    i.institution_name,
    er.toefl_minimum,
    er.ielts_minimum,
    er.out_of_state_tuition_intl
FROM english_requirements er
JOIN admission_cycles ac ON er.admission_cycle_id = ac.id
JOIN institutions i ON ac.institution_id = i.institution_id
WHERE er.toefl_minimum IS NOT NULL
ORDER BY er.toefl_minimum DESC;
```

---

#### `international_documents`
Required documents for international applicants (normalized multi-value field).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing document ID |
| admission_cycle_id | BIGINT | FOREIGN KEY → admission_cycles(id), ON DELETE CASCADE | Admission cycle reference |
| document_name | TEXT | NOT NULL | Name of required document |
| | | UNIQUE (admission_cycle_id, document_name) | No duplicate documents per cycle |

**Sample Documents:**
- "Completed online application"
- "Official academic transcripts"
- "Proof of English proficiency"
- "Copy of passport identification page"
- "Financial affidavit"

**Sample Query:**
```sql
SELECT 
    i.institution_name,
    STRING_AGG(id.document_name, ', ') AS required_documents
FROM international_documents id
JOIN admission_cycles ac ON id.admission_cycle_id = ac.id
JOIN institutions i ON ac.institution_id = i.institution_id
WHERE i.institution_name LIKE '%Harvard%'
GROUP BY i.institution_name;
```

---

#### `popular_majors`
Popular undergraduate majors per institution (normalized multi-value field).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing major ID |
| institution_id | BIGINT | FOREIGN KEY → institutions(institution_id), ON DELETE CASCADE | Institution reference |
| major_name | TEXT | NOT NULL | Name of major program |
| | | UNIQUE (institution_id, major_name) | No duplicate majors per institution |

**Sample Majors:**
- "Computer Science"
- "Business Administration"
- "Nursing"
- "Mechanical Engineering"
- "Psychology"

**Sample Query:**
```sql
SELECT 
    i.institution_name,
    STRING_AGG(pm.major_name, ', ') AS majors
FROM popular_majors pm
JOIN institutions i ON pm.institution_id = i.institution_id
WHERE i.rank <= 50
GROUP BY i.institution_name, i.rank
ORDER BY i.rank;
```

---

### User Management Tables

These tables handle application users, authentication, and authorization.

---

#### `profiles`
User profile information linked to Supabase Auth users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FOREIGN KEY → auth.users(id) ON DELETE CASCADE | References auth.users |
| full_name | TEXT | NULL | User's full name |
| email | TEXT | NULL | User's email address |
| avatar_url | TEXT | NULL | Profile picture URL |
| country | TEXT | NULL | User's country |
| intended_major | TEXT | NULL | Intended major field of study |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Record last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Index on `id`

**Policies:**
- Users can view, insert, and update their own profile
- Admins can view and update all profiles

**Sample Query:**
```sql
SELECT full_name, email, country, intended_major
FROM profiles
WHERE country = 'India'
ORDER BY created_at DESC;
```

---

#### `saved_schools`
User's saved/favorited institutions with notes and tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing record ID |
| user_id | UUID | NOT NULL, FOREIGN KEY → profiles(id) ON DELETE CASCADE | References user profile |
| institution_id | BIGINT | NOT NULL, FOREIGN KEY → institutions(institution_id) ON DELETE CASCADE | References institution |
| notes | TEXT | NULL | User's notes about the school |
| tags | TEXT[] | NULL | Array of user-defined tags |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Record last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique constraint on `(user_id, institution_id)` - prevents duplicate saves
- Index on `user_id`
- Index on `institution_id`
- Index on `created_at`

**Policies:**
- Users can manage their own saved schools
- Admins can view all saved schools

**Sample Query:**
```sql
SELECT ss.*, i.institution_name, i.rank
FROM saved_schools ss
JOIN institutions i ON ss.institution_id = i.institution_id
WHERE ss.user_id = auth.uid()
ORDER BY ss.created_at DESC;
```

**Usage in Application:**
- Dashboard: `/dashboard/saved` - View all saved schools with filtering
- Search: Save schools during exploration
- Compare: Export saved schools to CSV/PDF

---

#### `admin_users`
Admin user authorization and role management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-incrementing record ID |
| user_id | UUID | NOT NULL, FOREIGN KEY → profiles(id) ON DELETE CASCADE | References user profile |
| role | TEXT | NOT NULL, CHECK constraint | User role ('admin' or 'super_admin') |
| is_active | BOOLEAN | NOT NULL | Whether the admin account is active |
| permissions | JSONB | NOT NULL | JSON object with specific permissions |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Record last update timestamp |
| created_by | UUID | NULL, FOREIGN KEY → profiles(id) | Admin who created this record |

**Indexes:**
- Primary key on `id`
- Unique constraint on `user_id` - one admin record per user
- Index on `user_id`
- Index on `role`
- Index on `is_active`

**Check Constraints:**
- `role` must be 'admin' or 'super_admin'

**Policies:**
- Users can insert, update, and view their own admin record

**Sample Query:**
```sql
SELECT p.full_name, au.role, au.is_active, au.permissions
FROM admin_users au
JOIN profiles p ON au.user_id = p.id
WHERE au.is_active = true
ORDER BY au.role, p.full_name;
```

---

## Relationships Summary

### Foreign Key Cascade Rules

All child tables use `ON DELETE CASCADE` to maintain referential integrity:

**University Data:**
- Deleting an institution automatically removes all related enrollment stats, admission cycles, and majors
- Deleting an admission cycle removes all related test scores, requirements, English requirements, and documents
- Deleting a state removes all related cities
- Deleting a city does NOT cascade (institutions retain orphaned city_id references)

**User Management:**
- Deleting a user profile (`profiles`) automatically removes related `saved_schools`, `admin_users` records
- Deleting an admin user does NOT cascade to user profile (profile remains, just loses admin status)

### Cardinality

**University Data:**
- **One-to-Many**: `states → cities`
- **One-to-Many**: `institutions → enrollment_stats`
- **One-to-Many**: `institutions → admission_cycles`
- **One-to-Many**: `institutions → popular_majors`
- **One-to-One**: `admission_cycles → test_scores`
- **One-to-One**: `admission_cycles → admission_requirements`
- **One-to-One**: `admission_cycles → english_requirements`
- **One-to-Many**: `admission_cycles → international_documents`

**User Management:**
- **One-to-One**: `auth.users → profiles`
- **One-to-Many**: `profiles → saved_schools`
- **One-to-One**: `profiles → admin_users` (max one admin record per user)
- **One-to-Many**: `profiles → admin_users` (for tracking who created which admin accounts)

---

## Indexing Recommendations

For optimal query performance, consider adding indexes on:

```sql
-- University data foreign key indexes (automatically created on primary keys)
CREATE INDEX idx_cities_state_id ON cities(state_id);
CREATE INDEX idx_institutions_city_id ON institutions(city_id);
CREATE INDEX idx_enrollment_stats_institution_id ON enrollment_stats(institution_id);
CREATE INDEX idx_admission_cycles_institution_id ON admission_cycles(institution_id);
CREATE INDEX idx_test_scores_admission_cycle_id ON test_scores(admission_cycle_id);
CREATE INDEX idx_admission_requirements_admission_cycle_id ON admission_requirements(admission_cycle_id);
CREATE INDEX idx_english_requirements_admission_cycle_id ON english_requirements(admission_cycle_id);
CREATE INDEX idx_international_documents_admission_cycle_id ON international_documents(admission_cycle_id);
CREATE INDEX idx_popular_majors_institution_id ON popular_majors(institution_id);

-- University data commonly filtered columns
CREATE INDEX idx_institutions_rank ON institutions(rank) WHERE rank IS NOT NULL;
CREATE INDEX idx_enrollment_stats_year ON enrollment_stats(year_enrollment);
CREATE INDEX idx_admission_cycles_year ON admission_cycles(year_admissions);

-- User management indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_saved_schools_user_id ON saved_schools(user_id);
CREATE INDEX idx_saved_schools_institution_id ON saved_schools(institution_id);
CREATE INDEX idx_saved_schools_created_at ON saved_schools(created_at DESC);
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);
```

---

## Common Queries

### Get Complete Institution Profile

```sql
SELECT 
    i.institution_id,
    i.institution_name,
    i.rank,
    c.name AS city,
    s.name AS state,
    il.description AS level,
    ic.description AS control,
    ul.description AS locale,
    es.year_enrollment,
    es.undergraduate_headcount,
    es.bachelor_degree_count,
    ac.year_admissions,
    ac.tuition_and_fees,
    ac.percent_admitted_total,
    ts.sat_erw_75,
    ts.sat_math_75,
    er.toefl_minimum,
    er.ielts_minimum
FROM institutions i
LEFT JOIN cities c ON i.city_id = c.id
LEFT JOIN states s ON c.state_id = s.id
LEFT JOIN institution_levels il ON i.level_id = il.id
LEFT JOIN institution_controls ic ON i.control_id = ic.id
LEFT JOIN urbanization_locales ul ON i.locale_id = ul.id
LEFT JOIN enrollment_stats es ON i.institution_id = es.institution_id
LEFT JOIN admission_cycles ac ON i.institution_id = ac.institution_id
LEFT JOIN test_scores ts ON ac.id = ts.admission_cycle_id
LEFT JOIN english_requirements er ON ac.id = er.admission_cycle_id
WHERE i.institution_name = 'University of Alabama at Birmingham';
```

### Find Top Ranked Schools in a State

```sql
SELECT 
    i.institution_name,
    i.rank,
    c.name AS city,
    ac.tuition_and_fees,
    ac.percent_admitted_total
FROM institutions i
JOIN cities c ON i.city_id = c.id
JOIN states s ON c.state_id = s.id
LEFT JOIN admission_cycles ac ON i.institution_id = ac.institution_id
WHERE s.name = 'California' AND i.rank IS NOT NULL
ORDER BY i.rank
LIMIT 20;
```

### Schools by Major

```sql
SELECT 
    i.institution_name,
    i.rank,
    s.name AS state,
    pm.major_name
FROM popular_majors pm
JOIN institutions i ON pm.institution_id = i.institution_id
JOIN cities c ON i.city_id = c.id
JOIN states s ON c.state_id = s.id
WHERE pm.major_name ILIKE '%Computer Science%'
ORDER BY i.rank NULLS LAST;
```

### International Student Friendly Schools

```sql
SELECT 
    i.institution_name,
    s.name AS state,
    er.toefl_minimum,
    er.ielts_minimum,
    er.out_of_state_tuition_intl,
    ac.percent_admitted_total
FROM institutions i
JOIN cities c ON i.city_id = c.id
JOIN states s ON c.state_id = s.id
JOIN admission_cycles ac ON i.institution_id = ac.institution_id
JOIN english_requirements er ON ac.id = er.admission_cycle_id
WHERE er.toefl_minimum <= 79 
    AND er.out_of_state_tuition_intl IS NOT NULL
ORDER BY er.out_of_state_tuition_intl;
```

---

### User Management Queries

#### Get User's Saved Schools with Full Details

```sql
SELECT
    ss.*,
    i.institution_name,
    i.rank,
    c.name AS city,
    s.name AS state,
    il.description AS level,
    ic.description AS control,
    ac.tuition_and_fees,
    ac.percent_admitted_total
FROM saved_schools ss
JOIN institutions i ON ss.institution_id = i.institution_id
JOIN cities c ON i.city_id = c.id
JOIN states s ON c.state_id = s.id
JOIN institution_levels il ON i.level_id = il.id
JOIN institution_controls ic ON i.control_id = ic.id
LEFT JOIN admission_cycles ac ON i.institution_id = ac.institution_id
WHERE ss.user_id = auth.uid()
ORDER BY ss.created_at DESC;
```

#### Get User Profile

```sql
SELECT
    p.*,
    au.role AS admin_role,
    au.is_active AS admin_active
FROM profiles p
LEFT JOIN admin_users au ON p.id = au.user_id
WHERE p.id = auth.uid();
```

#### List All Admin Users

```sql
SELECT
    p.full_name,
    p.email,
    au.role,
    au.is_active,
    au.permissions,
    au.created_at,
    creator.full_name AS created_by_name
FROM admin_users au
JOIN profiles p ON au.user_id = p.id
LEFT JOIN profiles creator ON au.created_by = creator.id
ORDER BY au.role, p.full_name;
```

#### Get Saved Schools Statistics per User

```sql
SELECT
    p.full_name,
    p.email,
    COUNT(ss.id) AS saved_school_count,
    COUNT(CASE WHEN ss.tags IS NOT NULL AND array_length(ss.tags, 1) > 0 THEN 1 END) AS tagged_schools,
    COUNT(CASE WHEN ss.notes IS NOT NULL THEN 1 END) AS schools_with_notes
FROM profiles p
LEFT JOIN saved_schools ss ON p.id = ss.user_id
GROUP BY p.id, p.full_name, p.email
ORDER BY saved_school_count DESC NULLS LAST;
```

#### Find Users by Country

```sql
SELECT
    country,
    COUNT(*) AS user_count,
    COUNT(DISTINCT au.id) AS admin_count
FROM profiles p
LEFT JOIN admin_users au ON p.id = au.user_id AND au.is_active = true
WHERE country IS NOT NULL
GROUP BY country
ORDER BY user_count DESC;
```

---

## Data Quality Notes

1. **NULL Values**: Many columns allow NULL to accommodate missing data in source
2. **Rank**: Only ~300 institutions have rankings; rest are NULL
3. **Test Scores**: Community colleges and open-admission schools often have NULL scores
4. **International Data**: Some institutions have minimal international student data
5. **Year Consistency**: Most data is from 2023-2024 academic year

---

## Migration & Loading

The schema was created and loaded using:
- **Script**: `supabase/normalize_and_load_supabase.py`
- **Source**: `data/cleaned/csv/university_data_v2.csv`
- **Method**: Direct PostgreSQL connection via `psycopg2`
- **Approach**: 
  - Creates tables with `IF NOT EXISTS`
  - Uses `UPSERT` for idempotent reloads
  - Batched inserts (200 rows per batch) for performance

To reload or update data:
```bash
source venv/bin/activate
python supabase/normalize_and_load_supabase.py
```

---

## API Access (Supabase)

For application integration, use Supabase client libraries:

```javascript
// JavaScript/TypeScript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Query with joins
const { data, error } = await supabase
  .from('institutions')
  .select(`
    *,
    cities(name, states(name)),
    admission_cycles(*),
    popular_majors(major_name)
  `)
  .eq('rank', 100)
```

```python
# Python
from supabase import create_client

supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_ANON_KEY')
)

# Query with joins
response = supabase.table('institutions') \
    .select('*, cities(name, states(name)), admission_cycles(*)') \
    .eq('rank', 100) \
    .execute()
```

---

## Maintenance

### Backup
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Using pg_dump directly
pg_dump $SUPABASE_DB_URL > backup.sql
```

### Verify Data Integrity
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM institutions WHERE city_id NOT IN (SELECT id FROM cities);
SELECT COUNT(*) FROM enrollment_stats WHERE institution_id NOT IN (SELECT institution_id FROM institutions);

-- Check unique constraints
SELECT institution_id, year_enrollment, COUNT(*) 
FROM enrollment_stats 
GROUP BY institution_id, year_enrollment 
HAVING COUNT(*) > 1;
```

---

## Contact & Support

For questions about the schema or data:
- **Repository**: https://github.com/dwk601/university_etl
- **Documentation**: `/docs` directory
- **Scripts**: `/supabase` directory

---

**Last Updated**: November 18, 2025
**Schema Version**: 1.1
**University Records**: 2,386 institutions
**Total Tables**: 17 (14 university + 3 user management)
