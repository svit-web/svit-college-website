-- ============================================================
-- Migration: colleges → departments → courses restructure
--
-- Changes:
--  1. Fix SVIT name typo; rename slug svit → svit-degree
--  2. Add SVIT Diploma college (svit-diploma)
--  3. Move diploma depts to svit-diploma; rename codes (CE-DIP→DP-CE etc.)
--  4. Move ME/PG courses (ME-SOFTWARE, ME-STRUCTURE) into parent degree depts
--  5. Soft-delete CE-PG, CIV-PG departments
--  6. Strip degree_type from all dept metadata
--  7. Update degree dept slugs to degree-{name}
--  8. Remove duplicate/test courses (BTECH-CE, duplicate nursing)
--  9. placement_statistics: drop college_id, add department_id FK
-- 10. recruiters: add department_id FK
-- 11. homepage_items: add college_id FK
-- 12. Drop branches table
-- 13. Create user_role_enum + user_roles table (RBAC)
-- ============================================================

BEGIN;

-- ============================================================
-- 1. FIX SVIT NAME TYPO + RENAME SLUG TO svit-degree
-- ============================================================
UPDATE colleges
SET
  name       = 'Sardar Vallabhbhai Patel Institute of Technology',
  slug       = 'svit-degree',
  updated_at = NOW()
WHERE slug = 'svit';

-- ============================================================
-- 2. ADD SVIT DIPLOMA COLLEGE
-- ============================================================
INSERT INTO colleges (
  id, institute_id, name, slug, code, sort_order, status, metadata, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'd9c3c849-08e5-4a52-b678-b8ab23523a79',
  'SVIT Polytechnic',
  'svit-diploma',
  'SVITDIP',
  5,
  'published',
  '{"tagline": "Skill-based diploma programmes with strong industry linkage.", "kicker": "SVIT Group · Polytechnic"}',
  NOW(),
  NOW()
);

-- ============================================================
-- 3. MOVE DIPLOMA DEPTS TO svit-diploma + RENAME CODES/SLUGS
-- ============================================================
UPDATE departments
SET
  college_id = (SELECT id FROM colleges WHERE slug = 'svit-diploma'),
  code       = 'DP-CE',
  slug       = 'diploma-computer-engineering',
  metadata   = metadata - 'degree_type',
  updated_at = NOW()
WHERE code = 'CE-DIP';

UPDATE departments
SET
  college_id = (SELECT id FROM colleges WHERE slug = 'svit-diploma'),
  code       = 'DP-CIV',
  slug       = 'diploma-civil-engineering',
  metadata   = metadata - 'degree_type',
  updated_at = NOW()
WHERE code = 'CIV-DIP';

UPDATE departments
SET
  college_id = (SELECT id FROM colleges WHERE slug = 'svit-diploma'),
  code       = 'DP-ME',
  slug       = 'diploma-mechanical-engineering',
  metadata   = metadata - 'degree_type',
  updated_at = NOW()
WHERE code = 'ME-DIP';

UPDATE departments
SET
  college_id = (SELECT id FROM colleges WHERE slug = 'svit-diploma'),
  code       = 'DP-EE',
  slug       = 'diploma-electrical-engineering',
  metadata   = metadata - 'degree_type',
  updated_at = NOW()
WHERE code = 'EE-DIP';

UPDATE departments
SET
  college_id = (SELECT id FROM colleges WHERE slug = 'svit-diploma'),
  code       = 'DP-IT',
  slug       = 'diploma-information-technology',
  metadata   = metadata - 'degree_type',
  updated_at = NOW()
WHERE code = 'IT-DIP';

-- ============================================================
-- 4. MOVE ME/PG COURSES INTO PARENT DEGREE DEPARTMENTS
-- ============================================================
UPDATE courses
SET
  department_id = (SELECT id FROM departments WHERE code = 'CE'),
  updated_at    = NOW()
WHERE code = 'ME-SOFTWARE';

UPDATE courses
SET
  department_id = (SELECT id FROM departments WHERE code = 'CIV'),
  updated_at    = NOW()
WHERE code = 'ME-STRUCTURE';

-- ============================================================
-- 5. SOFT-DELETE CE-PG AND CIV-PG (now empty, merged into degree depts)
-- ============================================================
UPDATE departments
SET
  status     = 'archived',
  deleted_at = NOW(),
  updated_at = NOW()
WHERE code IN ('CE-PG', 'CIV-PG');

-- ============================================================
-- 6. STRIP degree_type FROM DEGREE DEPT METADATA
-- ============================================================
UPDATE departments
SET
  metadata   = metadata - 'degree_type',
  updated_at = NOW()
WHERE code IN ('CE','CIV','ME','EE','IT','EC','AE','CSD','MBA','MCA');

-- ============================================================
-- 7. UPDATE DEGREE DEPARTMENT SLUGS TO degree-{name}
-- ============================================================
UPDATE departments SET slug = 'degree-computer-engineering',       updated_at = NOW() WHERE code = 'CE';
UPDATE departments SET slug = 'degree-civil-engineering',          updated_at = NOW() WHERE code = 'CIV';
UPDATE departments SET slug = 'degree-mechanical-engineering',     updated_at = NOW() WHERE code = 'ME';
UPDATE departments SET slug = 'degree-electrical-engineering',     updated_at = NOW() WHERE code = 'EE';
UPDATE departments SET slug = 'degree-information-technology',     updated_at = NOW() WHERE code = 'IT';
UPDATE departments SET slug = 'degree-electronics-communication',  updated_at = NOW() WHERE code = 'EC';
UPDATE departments SET slug = 'degree-aeronautical-engineering',   updated_at = NOW() WHERE code = 'AE';
UPDATE departments SET slug = 'degree-computer-science-design',    updated_at = NOW() WHERE code = 'CSD';
UPDATE departments SET slug = 'degree-management-studies',         updated_at = NOW() WHERE code = 'MBA';
UPDATE departments SET slug = 'degree-computer-applications-pg',   updated_at = NOW() WHERE code = 'MCA';

-- ============================================================
-- 8. REMOVE DUPLICATE / TEST COURSES
-- ============================================================
DELETE FROM courses WHERE code = 'BTECH-CE';
DELETE FROM courses WHERE code = 'nursing';   -- duplicate of GNM

-- ============================================================
-- 9. PLACEMENT STATISTICS: college_id → department_id
-- ============================================================
ALTER TABLE placement_statistics DROP COLUMN IF EXISTS college_id;
ALTER TABLE placement_statistics
  ADD COLUMN IF NOT EXISTS department_id UUID
    REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS placement_statistics_department_id_idx
  ON placement_statistics(department_id);

-- ============================================================
-- 10. RECRUITERS: add department_id FK
-- ============================================================
ALTER TABLE recruiters
  ADD COLUMN IF NOT EXISTS department_id UUID
    REFERENCES departments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS recruiters_department_id_idx
  ON recruiters(department_id);

-- ============================================================
-- 11. HOMEPAGE ITEMS: add college_id FK
--     NULL = main homepage; set = specific college landing page
-- ============================================================
ALTER TABLE homepage_items
  ADD COLUMN IF NOT EXISTS college_id UUID
    REFERENCES colleges(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS homepage_items_college_id_idx
  ON homepage_items(college_id);

-- ============================================================
-- 12. DROP BRANCHES TABLE
-- ============================================================
DROP TABLE IF EXISTS branches CASCADE;

-- ============================================================
-- 13. USER ROLES (RBAC)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM ('super_admin', 'college_admin', 'dept_coordinator');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS user_roles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role_enum NOT NULL,
  college_id    UUID        REFERENCES colleges(id)    ON DELETE CASCADE,
  department_id UUID        REFERENCES departments(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- super_admin: no scope; college_admin: college only; coordinator: dept (college optional)
  CONSTRAINT user_roles_scope_check CHECK (
    (role = 'super_admin'     AND college_id IS NULL    AND department_id IS NULL) OR
    (role = 'college_admin'   AND college_id IS NOT NULL AND department_id IS NULL) OR
    (role = 'dept_coordinator' AND department_id IS NOT NULL)
  ),
  UNIQUE (user_id, role, college_id, department_id)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx       ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_college_id_idx    ON user_roles(college_id);
CREATE INDEX IF NOT EXISTS user_roles_department_id_idx ON user_roles(department_id);

COMMIT;
