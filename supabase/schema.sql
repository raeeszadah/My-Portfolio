-- ============================================================================
-- SUPABASE DATABASE SCHEMA & CONSTRAINTS FOR TECORITHAM PORTFOLIO
-- Project ID: txmbbpvkmmzjgyjiefgh
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABLES & CONSTRAINTS
-- ============================================================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CONSTRAINT profiles_name_not_empty CHECK (char_length(trim(name)) > 0),
  roles TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL CONSTRAINT profiles_bio_not_empty CHECK (char_length(trim(bio)) > 0),
  profile_image TEXT,
  resume_url TEXT,
  availability TEXT DEFAULT 'Available for new opportunities',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CONSTRAINT projects_title_not_empty CHECK (char_length(trim(title)) > 0),
  slug TEXT UNIQUE NOT NULL CONSTRAINT projects_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  description TEXT NOT NULL,
  long_description TEXT,
  thumbnail TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  demo_url TEXT,
  github_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CONSTRAINT skills_name_not_empty CHECK (char_length(trim(name)) > 0),
  category TEXT NOT NULL CONSTRAINT skills_category_check CHECK (category IN ('frontend', 'backend', 'devops', 'tools', 'languages', 'database', 'other')),
  level INT NOT NULL CONSTRAINT skills_level_range CHECK (level >= 0 AND level <= 100),
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXPERIENCES TABLE (Work Timeline)
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CONSTRAINT experiences_role_not_empty CHECK (char_length(trim(role)) > 0),
  company TEXT NOT NULL CONSTRAINT experiences_company_not_empty CHECK (char_length(trim(company)) > 0),
  logo TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT, -- NULL represents 'Present'
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  tech_tags TEXT[] DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EDUCATION TABLE (Academic Timeline)
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL CONSTRAINT education_degree_not_empty CHECK (char_length(trim(degree)) > 0),
  institution TEXT NOT NULL CONSTRAINT education_institution_not_empty CHECK (char_length(trim(institution)) > 0),
  logo TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  milestones TEXT[] DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CONSTRAINT certs_title_not_empty CHECK (char_length(trim(title)) > 0),
  issuer TEXT NOT NULL CONSTRAINT certs_issuer_not_empty CHECK (char_length(trim(issuer)) > 0),
  credential_id TEXT,
  verification_url TEXT,
  thumbnail TEXT,
  date TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CONSTRAINT achievements_title_not_empty CHECK (char_length(trim(title)) > 0),
  issuer TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  verification_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOCIAL LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CONSTRAINT socials_platform_not_empty CHECK (char_length(trim(platform)) > 0),
  url TEXT NOT NULL CONSTRAINT socials_url_format CHECK (url ~ '^https?://'),
  username TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MESSAGES TABLE (Visitor Contact Submissions)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CONSTRAINT messages_name_not_empty CHECK (char_length(trim(name)) > 0),
  email TEXT NOT NULL CONSTRAINT messages_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  subject TEXT NOT NULL CONSTRAINT messages_subject_not_empty CHECK (char_length(trim(subject)) > 0),
  message TEXT NOT NULL CONSTRAINT messages_body_not_empty CHECK (char_length(trim(message)) > 0),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_published_order ON public.projects (published, display_order);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_skills_published_order ON public.skills (published, display_order);
CREATE INDEX IF NOT EXISTS idx_experiences_order ON public.experiences (display_order);
CREATE INDEX IF NOT EXISTS idx_education_order ON public.education (display_order);
CREATE INDEX IF NOT EXISTS idx_certifications_published_order ON public.certifications (published, display_order);
CREATE INDEX IF NOT EXISTS idx_social_links_published_order ON public.social_links (published, display_order);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Read-only access for portfolio visitors)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Published Projects" ON public.projects FOR SELECT USING (published = true);
CREATE POLICY "Public Read Published Skills" ON public.skills FOR SELECT USING (published = true);
CREATE POLICY "Public Read Experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Public Read Education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Public Read Published Certifications" ON public.certifications FOR SELECT USING (published = true);
CREATE POLICY "Public Read Published Achievements" ON public.achievements FOR SELECT USING (published = true);
CREATE POLICY "Public Read Published Social Links" ON public.social_links FOR SELECT USING (published = true);

-- PUBLIC INSERT POLICY FOR CONTACT MESSAGES
DROP POLICY IF EXISTS "Public Submit Message" ON public.messages;
CREATE POLICY "Public Submit Message" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);


-- ADMIN FULL ACCESS POLICIES (Allow full access to portfolio tables)
DROP POLICY IF EXISTS "Admin Full Profiles" ON public.profiles;
CREATE POLICY "Admin Full Profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Projects" ON public.projects;
CREATE POLICY "Admin Full Projects" ON public.projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Skills" ON public.skills;
CREATE POLICY "Admin Full Skills" ON public.skills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Experiences" ON public.experiences;
CREATE POLICY "Admin Full Experiences" ON public.experiences FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Education" ON public.education;
CREATE POLICY "Admin Full Education" ON public.education FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Certifications" ON public.certifications;
CREATE POLICY "Admin Full Certifications" ON public.certifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Achievements" ON public.achievements;
CREATE POLICY "Admin Full Achievements" ON public.achievements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Social Links" ON public.social_links;
CREATE POLICY "Admin Full Social Links" ON public.social_links FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Full Messages" ON public.messages;
CREATE POLICY "Admin Full Messages" ON public.messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


