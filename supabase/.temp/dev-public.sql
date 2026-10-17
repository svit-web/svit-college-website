--
-- PostgreSQL database dump
--

\restrict 0Aq6KEty9xeIyoEuDHYClYU3IgfOxdIjMAfcAztd05RwtiEummm3tisrfVEmLaD

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: content_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.content_status AS ENUM (
    'draft',
    'published',
    'archived'
);


--
-- Name: degree_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.degree_level AS ENUM (
    'undergraduate',
    'graduate',
    'doctorate',
    'certificate'
);


--
-- Name: event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_status AS ENUM (
    'draft',
    'published',
    'cancelled',
    'archived'
);


--
-- Name: facility_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.facility_type AS ENUM (
    'campus',
    'building',
    'laboratory'
);


--
-- Name: link_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.link_type AS ENUM (
    'internal',
    'external'
);


--
-- Name: scope_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.scope_level AS ENUM (
    'global',
    'trust',
    'institute',
    'college',
    'department'
);


--
-- Name: staff_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.staff_type AS ENUM (
    'faculty',
    'office_staff'
);


--
-- Name: submission_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.submission_status AS ENUM (
    'unread',
    'read',
    'replied'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_enum AS ENUM (
    'super_admin',
    'college_admin',
    'dept_coordinator'
);


--
-- Name: can_write_event(public.scope_level, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_write_event(p_scope_type public.scope_level, p_college_id uuid, p_department_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'published'
      AND ur.deleted_at IS NULL
      AND (
        ur.scope_type = 'global'
        OR (ur.scope_type = 'college' AND p_scope_type = 'college' AND ur.college_id = p_college_id)
        OR (ur.scope_type = 'department' AND p_scope_type = 'department' AND ur.department_id = p_department_id)
      )
  );
$$;


--
-- Name: can_write_scoped_record(uuid, uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_write_scoped_record(p_trust_id uuid DEFAULT NULL::uuid, p_institute_id uuid DEFAULT NULL::uuid, p_college_id uuid DEFAULT NULL::uuid, p_department_id uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
      and (
        ur.scope_type = 'global'
        or (ur.scope_type = 'trust' and p_trust_id is not null and ur.trust_id = p_trust_id)
        or (ur.scope_type = 'institute' and p_institute_id is not null and ur.institute_id = p_institute_id)
        or (ur.scope_type = 'college' and p_college_id is not null and ur.college_id = p_college_id)
        or (ur.scope_type = 'department' and p_department_id is not null and ur.department_id = p_department_id)
      )
  );
$$;


--
-- Name: current_user_is_dept_admin_for(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_user_is_dept_admin_for(target_dept_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.code = 'department_admin'
      AND ur.department_id = target_dept_id
      AND ur.deleted_at IS NULL
      AND ur.status = 'published'
  );
$$;


--
-- Name: events_before_write(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.events_before_write() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  IF NEW.scope_type = 'department' AND NEW.department_id IS NOT NULL AND NEW.college_id IS NULL THEN
    SELECT d.college_id INTO NEW.college_id FROM public.departments d WHERE d.id = NEW.department_id;
  END IF;

  IF NEW.is_featured AND (TG_OP = 'INSERT' OR NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    NEW.featured_at := timezone('utc'::text, now());
    NEW.featured_by := auth.uid();
  ELSIF NOT NEW.is_featured AND (TG_OP = 'UPDATE' AND NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    NEW.featured_at := NULL;
    NEW.featured_by := NULL;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: events_enforce_featured_rules(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.events_enforce_featured_rules() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  featured_count integer;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.is_featured)
     OR (TG_OP = 'UPDATE' AND NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.scope_type = 'global'
        AND ur.status = 'published'
        AND ur.deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Only a global administrator can feature or unfeature an event';
    END IF;
  END IF;

  IF NEW.is_featured AND (TG_OP = 'INSERT' OR NEW.is_featured IS DISTINCT FROM OLD.is_featured) THEN
    SELECT count(*) INTO featured_count
    FROM public.events
    WHERE is_featured = true AND deleted_at IS NULL AND id IS DISTINCT FROM NEW.id;

    IF featured_count >= 8 THEN
      RAISE EXCEPTION 'At most 8 events can be featured on the homepage at once';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: get_table_schema_info(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_table_schema_info(target_table text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  cols jsonb;
  fks jsonb;
  pk text;
BEGIN
  -- Get columns info, including enum label lists for USER-DEFINED (enum) columns
  SELECT jsonb_agg(json_build_object(
    'name', c.column_name,
    'type', c.data_type,
    'is_nullable', (c.is_nullable = 'YES'),
    'default', c.column_default,
    'max_length', c.character_maximum_length,
    'enum_values', (
      CASE WHEN c.data_type = 'USER-DEFINED' THEN (
        SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder)
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname = c.udt_name
      ) ELSE NULL END
    )
  ))
  INTO cols
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = target_table;

  -- Get foreign keys info
  SELECT jsonb_agg(json_build_object(
    'column', kcu.column_name,
    'foreign_table', ccu.table_name,
    'foreign_column', ccu.column_name
  ))
  INTO fks
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = target_table;

  -- Get primary key name
  SELECT kcu.column_name
  INTO pk
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = target_table
  LIMIT 1;

  RETURN jsonb_build_object(
    'table', target_table,
    'primary_key', COALESCE(pk, 'id'),
    'columns', COALESCE(cols, '[]'::jsonb),
    'foreign_keys', COALESCE(fks, '[]'::jsonb)
  );
END;
$$;


--
-- Name: handle_first_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_first_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role_id, scope_type, status)
    VALUES (
      NEW.id,
      (SELECT id FROM public.roles WHERE code = 'admin' LIMIT 1),
      'global'::public.scope_level,
      'published'::public.content_status
    );
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into public.user_profiles (id, first_name, last_name, avatar_url, bio, status, metadata)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'bio',
    'published'::public.content_status,
    '{}'::jsonb
  );
  return new;
end;
$$;


--
-- Name: is_global_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_global_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.status = 'published'
      and ur.deleted_at is null
      and ur.scope_type = 'global'
  );
$$;


--
-- Name: process_audit_log(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_audit_log() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare
    v_user_id uuid;
    v_client_ip text;
    v_user_agent text;
begin
    -- Retrieve Supabase transaction context parameters if available
    begin
        v_user_id := auth.uid();
    exception when others then
        v_user_id := null;
    end;
    
    begin
        v_client_ip := current_setting('request.headers', true)::jsonb->>'x-forwarded-for';
        v_user_agent := current_setting('request.headers', true)::jsonb->>'user-agent';
    exception when others then
        v_client_ip := null;
        v_user_agent := null;
    end;

    if (tg_op = 'INSERT') then
        insert into public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, client_ip, user_agent)
        values (v_user_id, tg_op, tg_table_name, new.id, null, to_jsonb(new), v_client_ip, v_user_agent);
        return new;
    elsif (tg_op = 'UPDATE') then
        insert into public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, client_ip, user_agent)
        values (v_user_id, tg_op, tg_table_name, new.id, to_jsonb(old), to_jsonb(new), v_client_ip, v_user_agent);
        return new;
    elsif (tg_op = 'DELETE') then
        insert into public.audit_logs (user_id, action, table_name, record_id, old_values, new_values, client_ip, user_agent)
        values (v_user_id, tg_op, tg_table_name, old.id, to_jsonb(old), null, v_client_ip, v_user_agent);
        return old;
    end if;
    return null;
end;
$$;


--
-- Name: set_scholarships_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_scholarships_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_sports_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sports_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accreditations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accreditations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization text NOT NULL,
    value text NOT NULL,
    received_year integer NOT NULL,
    expiry_date date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    accreditation_body text,
    description text,
    document_url text
);


--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    date date NOT NULL,
    category text NOT NULL,
    featured_image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT achievements_category_check CHECK ((category = ANY (ARRAY['student'::text, 'faculty'::text, 'college'::text, 'department'::text]))),
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL))))
);


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    old_values jsonb,
    new_values jsonb,
    client_ip text,
    user_agent text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: board_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.board_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid NOT NULL,
    name text NOT NULL,
    designation text NOT NULL,
    photo_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid
);


--
-- Name: cells; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cells (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: centers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.centers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid,
    institute_id uuid,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    subtitle text,
    description text,
    accent_color text,
    CONSTRAINT center_parent_check CHECK (((college_id IS NOT NULL) OR (institute_id IS NOT NULL)))
);


--
-- Name: club_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.club_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    image_url text,
    status public.event_status DEFAULT 'published'::public.event_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid
);


--
-- Name: colleges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.colleges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    institute_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text NOT NULL,
    logo_url text,
    website_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    tagline text,
    hero_kicker text,
    hero_subhead text,
    show_in_navigation boolean DEFAULT true NOT NULL,
    CONSTRAINT code_format CHECK ((code ~* '^[A-Z0-9]+$'::text)),
    CONSTRAINT slug_format CHECK ((slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text))
);


--
-- Name: committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: content_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    module_type text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    department_id uuid,
    name text NOT NULL,
    code text NOT NULL,
    degree_level public.degree_level NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    intake integer,
    fees_per_semester text,
    description text,
    duration text,
    eligibility text,
    short_name text,
    year_started integer,
    duration_years integer,
    is_programme boolean DEFAULT false,
    programme_slug text,
    tagline text,
    full_name text,
    color text,
    accent text,
    brochure_file_url text
);


--
-- Name: COLUMN courses.brochure_file_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.courses.brochure_file_url IS 'Public URL of the course brochure PDF. Rendered as the "Download Now" link on /admissions/intake-fees. Storage-agnostic: holds an absolute URL, so moving the files from Supabase Storage to an S3 bucket is a re-upload plus a URL update, with no schema change.';


--
-- Name: department_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    department_id uuid NOT NULL,
    activity_type text NOT NULL,
    title text NOT NULL,
    company text,
    start_date date NOT NULL,
    end_date date,
    notes text,
    document_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT department_activities_activity_type_check CHECK ((activity_type = ANY (ARRAY['sttp_fdp'::text, 'expert_lecture'::text, 'seminar_workshop'::text, 'mou'::text, 'industry_visit'::text])))
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    head_of_department_id uuid,
    logo_url text,
    about text,
    vision text,
    mission text,
    intake_ug integer,
    intake_pg integer,
    established_year integer,
    level text,
    degree_type text,
    short_name text,
    theme_color text,
    overview text,
    CONSTRAINT slug_format CHECK ((slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text))
);


--
-- Name: designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: downloads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.downloads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    file_url text NOT NULL,
    file_type text,
    file_size integer,
    category text NOT NULL,
    publish_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT downloads_category_check CHECK ((category = ANY (ARRAY['circular'::text, 'notice'::text, 'syllabus'::text, 'form'::text, 'other'::text])))
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    tag text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    location text,
    map_url text,
    registration_link text,
    featured_image_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    seo_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    college_id uuid,
    is_featured boolean DEFAULT false NOT NULL,
    featured_at timestamp with time zone,
    featured_by uuid,
    subtitle text,
    accent_color text,
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL)))),
    CONSTRAINT event_date_check CHECK ((start_date <= end_date)),
    CONSTRAINT events_scope_consistency CHECK ((((scope_type = ANY (ARRAY['global'::public.scope_level, 'trust'::public.scope_level, 'institute'::public.scope_level])) AND (college_id IS NULL) AND (department_id IS NULL)) OR ((scope_type = 'college'::public.scope_level) AND (college_id IS NOT NULL) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL))))
);


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facilities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    facility_type public.facility_type NOT NULL,
    parent_id uuid,
    institute_id uuid,
    department_id uuid,
    name text NOT NULL,
    slug text,
    address text,
    code text,
    room_number text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    subtitle text,
    description text,
    category text,
    accent_color text,
    CONSTRAINT check_facility_fields CHECK ((((facility_type = 'campus'::public.facility_type) AND (institute_id IS NOT NULL) AND (parent_id IS NULL)) OR ((facility_type = 'building'::public.facility_type) AND (parent_id IS NOT NULL)) OR ((facility_type = 'laboratory'::public.facility_type) AND (department_id IS NOT NULL))))
);


--
-- Name: gallery_albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_albums (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    cover_image_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL))))
);


--
-- Name: gallery_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    album_id uuid NOT NULL,
    media_type text NOT NULL,
    url text NOT NULL,
    caption text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT gallery_media_media_type_check CHECK ((media_type = ANY (ARRAY['image'::text, 'video'::text])))
);


--
-- Name: homepage_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    item_type text NOT NULL,
    eyebrow text,
    title text NOT NULL,
    title_accent text,
    subtitle text,
    body text,
    image_url text,
    icon_name text,
    link_href text,
    link_label text,
    secondary_link_href text,
    secondary_link_label text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    college_id uuid,
    pretitle text,
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL)) OR ((scope_type = 'college'::public.scope_level) AND (college_id IS NOT NULL))))
);


--
-- Name: homepage_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    title text,
    section_type text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL))))
);


--
-- Name: homepage_widgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homepage_widgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_id uuid NOT NULL,
    title text,
    widget_type text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: inquiry_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiry_forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_name text NOT NULL,
    fields_config jsonb DEFAULT '[]'::jsonb NOT NULL,
    recipient_emails text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: inquiry_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiry_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    submitted_data jsonb NOT NULL,
    status public.submission_status DEFAULT 'unread'::public.submission_status NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: institutes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trust_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    website_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT slug_format CHECK ((slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text))
);


--
-- Name: media_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    folder_id uuid,
    filename text NOT NULL,
    file_path text NOT NULL,
    mime_type text NOT NULL,
    file_size integer NOT NULL,
    alt_text text,
    caption text,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL))))
);


--
-- Name: media_folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    name text NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL))))
);


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    menu_id uuid NOT NULL,
    parent_id uuid,
    title text NOT NULL,
    link_type public.link_type NOT NULL,
    url text,
    page_id uuid,
    icon text,
    sort_order integer DEFAULT 0 NOT NULL,
    permissions_required text[] DEFAULT '{}'::text[] NOT NULL,
    visibility_rules jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    menu_type text DEFAULT 'simple'::text,
    CONSTRAINT menu_item_url_check CHECK ((((link_type = 'internal'::public.link_type) AND (page_id IS NOT NULL)) OR ((link_type = 'external'::public.link_type) AND (url IS NOT NULL)))),
    CONSTRAINT menu_items_menu_type_check CHECK ((menu_type = ANY (ARRAY['simple'::text, 'colleges_mega'::text, 'campus_mega'::text, 'placement_mega'::text])))
);


--
-- Name: COLUMN menu_items.menu_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.menu_items.menu_type IS 'Controls menu behavior: simple (plain link), colleges_mega (colleges dropdown with departments), campus_mega (campus life sections), placement_mega (placement divisions)';


--
-- Name: menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: mous; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mous (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    partner_organization text NOT NULL,
    logo_url text,
    purpose text,
    signed_date date NOT NULL,
    expiry_date date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    department_name text,
    location text,
    activities text[]
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text,
    parent_id uuid,
    is_homepage boolean DEFAULT false NOT NULL,
    seo_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    page_type text,
    schema_version integer DEFAULT 1,
    CONSTRAINT slug_format CHECK ((slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text))
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: placed_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placed_students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_id uuid NOT NULL,
    department_id uuid,
    student_name text DEFAULT 'Student'::text NOT NULL,
    company_name text NOT NULL,
    photo_url text,
    batch_year text DEFAULT '2024'::text,
    package_lpa numeric(5,2),
    status text DEFAULT 'published'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT placed_students_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: placement_cells; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.placement_cells (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    college_code text NOT NULL,
    about_text text DEFAULT ''::text NOT NULL,
    officer_name text DEFAULT ''::text NOT NULL,
    officer_designation text DEFAULT 'Training & Placement Officer'::text NOT NULL,
    officer_phone text DEFAULT ''::text NOT NULL,
    officer_email text DEFAULT ''::text NOT NULL,
    officer_photo_url text,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    default_student_placeholder_url text,
    hero_title text,
    hero_subtitle text
);


--
-- Name: COLUMN placement_cells.hero_title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_cells.hero_title IS 'Optional hero heading for this division''s placement section. Falls back to a default when null.';


--
-- Name: COLUMN placement_cells.hero_subtitle; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.placement_cells.hero_subtitle IS 'Optional hero subheading. Falls back to a default when null.';


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scope_type public.scope_level DEFAULT 'global'::public.scope_level NOT NULL,
    department_id uuid,
    title text NOT NULL,
    slug text NOT NULL,
    summary text,
    content text,
    featured_image_url text,
    category_id uuid,
    is_featured boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    expires_at timestamp with time zone,
    seo_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'draft'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT check_content_scope CHECK ((((scope_type = 'global'::public.scope_level) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL))))
);


--
-- Name: recruiters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recruiters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name text NOT NULL,
    logo_url text,
    website_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    department_id uuid,
    college_codes text[]
);


--
-- Name: COLUMN recruiters.college_codes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.recruiters.college_codes IS 'College slugs this recruiter is shown for. NULL or empty means all divisions.';


--
-- Name: redirects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.redirects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_path text NOT NULL,
    target_path text NOT NULL,
    status_code integer DEFAULT 301 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT redirects_status_code_check CHECK ((status_code = ANY (ARRAY[301, 302, 307, 308])))
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: scholarships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scholarships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'merit'::text NOT NULL,
    description text,
    eligibility text,
    amount text,
    provider text,
    status text DEFAULT 'published'::text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid
);


--
-- Name: seo_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seo_metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meta_title text,
    meta_description text,
    meta_keywords text[] DEFAULT '{}'::text[] NOT NULL,
    canonical_url text,
    og_title text,
    og_description text,
    og_image_url text,
    twitter_card text,
    structured_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    robots_directives text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: sports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    category text DEFAULT 'outdoor'::text NOT NULL,
    description text,
    cover_image_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 10 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    players_count integer,
    coach_name text,
    coach_image_url text,
    achievements_count integer
);


--
-- Name: sports_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sport_id uuid,
    title text NOT NULL,
    description text,
    achievement_date date,
    level text DEFAULT 'university'::text NOT NULL,
    "position" text,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 10 NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid
);


--
-- Name: staff_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    year integer,
    description text,
    extra jsonb,
    status text DEFAULT 'published'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    CONSTRAINT staff_achievements_type_check CHECK ((type = ANY (ARRAY['award'::text, 'patent'::text, 'publication'::text, 'research'::text, 'qualification'::text, 'experience'::text])))
);


--
-- Name: staff_department_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_department_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_id uuid NOT NULL,
    department_id uuid NOT NULL,
    designation_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    rank_group text,
    designation_override text
);


--
-- Name: staff_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    bio text,
    office_hours jsonb DEFAULT '{}'::jsonb NOT NULL,
    social_links jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    expertise text[] DEFAULT '{}'::text[] NOT NULL,
    joining_year integer,
    past_experience_years integer,
    employee_code text,
    photo_url text,
    rank_group text,
    designation text,
    qualification text,
    gender text
);


--
-- Name: student_clubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_clubs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo_url text,
    coordinator_id uuid,
    student_coordinator_name text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    featured boolean DEFAULT false,
    department_id uuid,
    subtitle text,
    accent_color text
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_name text NOT NULL,
    author_role text NOT NULL,
    company_or_institution text,
    quote text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: trusts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trusts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    website_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT slug_format CHECK ((slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text))
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    first_name text,
    last_name text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    scope_type public.scope_level NOT NULL,
    trust_id uuid,
    institute_id uuid,
    college_id uuid,
    department_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    status public.content_status DEFAULT 'published'::public.content_status NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT scope_fkey_check CHECK ((((scope_type = 'global'::public.scope_level) AND (trust_id IS NULL) AND (institute_id IS NULL) AND (college_id IS NULL) AND (department_id IS NULL)) OR ((scope_type = 'trust'::public.scope_level) AND (trust_id IS NOT NULL) AND (institute_id IS NULL) AND (college_id IS NULL) AND (department_id IS NULL)) OR ((scope_type = 'institute'::public.scope_level) AND (institute_id IS NOT NULL) AND (trust_id IS NULL) AND (college_id IS NULL) AND (department_id IS NULL)) OR ((scope_type = 'college'::public.scope_level) AND (college_id IS NOT NULL) AND (trust_id IS NULL) AND (institute_id IS NULL) AND (department_id IS NULL)) OR ((scope_type = 'department'::public.scope_level) AND (department_id IS NOT NULL) AND (trust_id IS NULL) AND (institute_id IS NULL) AND (college_id IS NULL))))
);


--
-- Name: accreditations accreditations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: board_members board_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_pkey PRIMARY KEY (id);


--
-- Name: cells cells_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cells
    ADD CONSTRAINT cells_pkey PRIMARY KEY (id);


--
-- Name: centers centers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.centers
    ADD CONSTRAINT centers_pkey PRIMARY KEY (id);


--
-- Name: club_events club_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_events
    ADD CONSTRAINT club_events_pkey PRIMARY KEY (id);


--
-- Name: colleges colleges_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_code_key UNIQUE (code);


--
-- Name: colleges colleges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_pkey PRIMARY KEY (id);


--
-- Name: colleges colleges_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_slug_key UNIQUE (slug);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: content_categories content_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT content_categories_pkey PRIMARY KEY (id);


--
-- Name: courses courses_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_key UNIQUE (code);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: department_activities department_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: designations designations_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_title_key UNIQUE (title);


--
-- Name: downloads downloads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.downloads
    ADD CONSTRAINT downloads_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: gallery_albums gallery_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_pkey PRIMARY KEY (id);


--
-- Name: gallery_media gallery_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_media
    ADD CONSTRAINT gallery_media_pkey PRIMARY KEY (id);


--
-- Name: homepage_items homepage_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_items
    ADD CONSTRAINT homepage_items_pkey PRIMARY KEY (id);


--
-- Name: homepage_sections homepage_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_sections
    ADD CONSTRAINT homepage_sections_pkey PRIMARY KEY (id);


--
-- Name: homepage_widgets homepage_widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_widgets
    ADD CONSTRAINT homepage_widgets_pkey PRIMARY KEY (id);


--
-- Name: inquiry_forms inquiry_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_forms
    ADD CONSTRAINT inquiry_forms_pkey PRIMARY KEY (id);


--
-- Name: inquiry_submissions inquiry_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_submissions
    ADD CONSTRAINT inquiry_submissions_pkey PRIMARY KEY (id);


--
-- Name: institutes institutes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_pkey PRIMARY KEY (id);


--
-- Name: institutes institutes_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_slug_key UNIQUE (slug);


--
-- Name: media_files media_files_file_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_file_path_key UNIQUE (file_path);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: mous mous_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mous
    ADD CONSTRAINT mous_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: placed_students placed_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placed_students
    ADD CONSTRAINT placed_students_pkey PRIMARY KEY (id);


--
-- Name: placement_cells placement_cells_college_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_cells
    ADD CONSTRAINT placement_cells_college_code_key UNIQUE (college_code);


--
-- Name: placement_cells placement_cells_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placement_cells
    ADD CONSTRAINT placement_cells_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: recruiters recruiters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_pkey PRIMARY KEY (id);


--
-- Name: redirects redirects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: scholarships scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_pkey PRIMARY KEY (id);


--
-- Name: seo_metadata seo_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_pkey PRIMARY KEY (id);


--
-- Name: sports_achievements sports_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_achievements
    ADD CONSTRAINT sports_achievements_pkey PRIMARY KEY (id);


--
-- Name: sports sports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_pkey PRIMARY KEY (id);


--
-- Name: sports sports_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_slug_key UNIQUE (slug);


--
-- Name: staff_achievements staff_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_achievements
    ADD CONSTRAINT staff_achievements_pkey PRIMARY KEY (id);


--
-- Name: staff_department_assignments staff_department_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT staff_department_assignments_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_email_key UNIQUE (email);


--
-- Name: staff_profiles staff_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_clubs student_clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_clubs
    ADD CONSTRAINT student_clubs_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: trusts trusts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trusts
    ADD CONSTRAINT trusts_pkey PRIMARY KEY (id);


--
-- Name: trusts trusts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trusts
    ADD CONSTRAINT trusts_slug_key UNIQUE (slug);


--
-- Name: content_categories unique_category_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT unique_category_slug UNIQUE (slug, module_type);


--
-- Name: student_clubs unique_club_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_clubs
    ADD CONSTRAINT unique_club_slug UNIQUE (slug);


--
-- Name: departments unique_college_dept_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT unique_college_dept_code UNIQUE (college_id, code);


--
-- Name: departments unique_college_dept_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT unique_college_dept_slug UNIQUE (college_id, slug);


--
-- Name: facilities unique_facility_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT unique_facility_slug UNIQUE (slug);


--
-- Name: staff_department_assignments unique_faculty_dept; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT unique_faculty_dept UNIQUE (staff_id, department_id);


--
-- Name: inquiry_forms unique_form_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_forms
    ADD CONSTRAINT unique_form_name UNIQUE (form_name);


--
-- Name: menus unique_menu_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT unique_menu_code UNIQUE (code);


--
-- Name: pages unique_page_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT unique_page_slug UNIQUE (slug);


--
-- Name: redirects unique_source_redirect; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT unique_source_redirect UNIQUE (source_path);


--
-- Name: user_roles unique_user_role_scope; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT unique_user_role_scope UNIQUE (user_id, role_id, scope_type, trust_id, institute_id, college_id, department_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: club_events_club_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX club_events_club_id_idx ON public.club_events USING btree (club_id);


--
-- Name: department_activities_department_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX department_activities_department_id_idx ON public.department_activities USING btree (department_id);


--
-- Name: department_activities_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX department_activities_type_idx ON public.department_activities USING btree (activity_type);


--
-- Name: homepage_items_college_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX homepage_items_college_id_idx ON public.homepage_items USING btree (college_id);


--
-- Name: idx_achievements_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_achievements_scope ON public.achievements USING btree (scope_type, department_id);


--
-- Name: idx_college_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_college_slug ON public.colleges USING btree (slug);


--
-- Name: idx_colleges_institute_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_colleges_institute_id ON public.colleges USING btree (institute_id);


--
-- Name: idx_courses_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courses_department_id ON public.courses USING btree (department_id);


--
-- Name: idx_courses_is_programme; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_courses_is_programme ON public.courses USING btree (is_programme) WHERE (is_programme = true);


--
-- Name: idx_departments_college_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_departments_college_id ON public.departments USING btree (college_id);


--
-- Name: idx_dept_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dept_slug ON public.departments USING btree (slug);


--
-- Name: idx_event_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_slug ON public.events USING btree (slug);


--
-- Name: idx_events_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_active ON public.events USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_events_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_scope ON public.events USING btree (scope_type, department_id);


--
-- Name: idx_facilities_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_facilities_department_id ON public.facilities USING btree (department_id);


--
-- Name: idx_facilities_institute_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_facilities_institute_id ON public.facilities USING btree (institute_id);


--
-- Name: idx_facilities_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_facilities_parent_id ON public.facilities USING btree (parent_id);


--
-- Name: idx_facility_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_facility_slug ON public.facilities USING btree (slug);


--
-- Name: idx_gallery_albums_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_gallery_albums_scope ON public.gallery_albums USING btree (scope_type, department_id);


--
-- Name: idx_homepage_items_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_homepage_items_scope ON public.homepage_items USING btree (scope_type, department_id);


--
-- Name: idx_homepage_sections_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_homepage_sections_scope ON public.homepage_sections USING btree (scope_type, department_id);


--
-- Name: idx_homepage_widgets_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_homepage_widgets_section_id ON public.homepage_widgets USING btree (section_id);


--
-- Name: idx_institute_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_institute_slug ON public.institutes USING btree (slug);


--
-- Name: idx_institutes_trust_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_institutes_trust_id ON public.institutes USING btree (trust_id);


--
-- Name: idx_media_files_folder_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_files_folder_id ON public.media_files USING btree (folder_id);


--
-- Name: idx_media_files_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_files_scope ON public.media_files USING btree (scope_type, department_id);


--
-- Name: idx_media_folders_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_media_folders_scope ON public.media_folders USING btree (scope_type, department_id);


--
-- Name: idx_menu_items_menu_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_menu_items_menu_id ON public.menu_items USING btree (menu_id);


--
-- Name: idx_page_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_page_slug ON public.pages USING btree (slug);


--
-- Name: idx_pages_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pages_active ON public.pages USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_post_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_post_slug ON public.posts USING btree (slug);


--
-- Name: idx_posts_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_active ON public.posts USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: idx_posts_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_scope ON public.posts USING btree (scope_type, department_id);


--
-- Name: idx_staff_achievements_staff_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_achievements_staff_id ON public.staff_achievements USING btree (staff_id);


--
-- Name: idx_staff_achievements_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_achievements_type ON public.staff_achievements USING btree (type);


--
-- Name: idx_staff_employee_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_staff_employee_code ON public.staff_profiles USING btree (employee_code) WHERE (employee_code IS NOT NULL);


--
-- Name: idx_trust_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trust_slug ON public.trusts USING btree (slug);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: placed_students_batch_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placed_students_batch_year_idx ON public.placed_students USING btree (batch_year DESC NULLS LAST);


--
-- Name: placed_students_college_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placed_students_college_id_idx ON public.placed_students USING btree (college_id, status);


--
-- Name: placed_students_department_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX placed_students_department_id_idx ON public.placed_students USING btree (department_id);


--
-- Name: recruiters_department_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX recruiters_department_id_idx ON public.recruiters USING btree (department_id);


--
-- Name: recruiters_unique_live_company_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX recruiters_unique_live_company_name ON public.recruiters USING btree (lower(regexp_replace(TRIM(BOTH FROM company_name), '\s+'::text, ' '::text, 'g'::text))) WHERE (deleted_at IS NULL);


--
-- Name: scholarships_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scholarships_sort_order_idx ON public.scholarships USING btree (sort_order, created_at);


--
-- Name: unique_achievement_slug_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_achievement_slug_dept ON public.achievements USING btree (department_id, slug) WHERE (department_id IS NOT NULL);


--
-- Name: unique_achievement_slug_global; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_achievement_slug_global ON public.achievements USING btree (slug) WHERE (department_id IS NULL);


--
-- Name: unique_album_slug_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_album_slug_dept ON public.gallery_albums USING btree (department_id, slug) WHERE (department_id IS NOT NULL);


--
-- Name: unique_album_slug_global; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_album_slug_global ON public.gallery_albums USING btree (slug) WHERE (department_id IS NULL);


--
-- Name: unique_event_slug_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_event_slug_dept ON public.events USING btree (department_id, slug) WHERE (department_id IS NOT NULL);


--
-- Name: unique_event_slug_global; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_event_slug_global ON public.events USING btree (slug) WHERE (department_id IS NULL);


--
-- Name: unique_folder_parent_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_folder_parent_dept ON public.media_folders USING btree (department_id, name, parent_id) WHERE (department_id IS NOT NULL);


--
-- Name: unique_folder_parent_global; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_folder_parent_global ON public.media_folders USING btree (name, parent_id) WHERE (department_id IS NULL);


--
-- Name: unique_homepage; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_homepage ON public.pages USING btree (is_homepage) WHERE (is_homepage = true);


--
-- Name: unique_post_slug_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_post_slug_dept ON public.posts USING btree (department_id, slug) WHERE (department_id IS NOT NULL);


--
-- Name: unique_post_slug_global; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_post_slug_global ON public.posts USING btree (slug) WHERE (department_id IS NULL);


--
-- Name: user_roles_college_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_college_id_idx ON public.user_roles USING btree (college_id);


--
-- Name: user_roles_department_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_department_id_idx ON public.user_roles USING btree (department_id);


--
-- Name: user_roles_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_user_id_idx ON public.user_roles USING btree (user_id);


--
-- Name: events audit_events_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_events_trigger AFTER INSERT OR DELETE OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: homepage_sections audit_homepage_sections_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_homepage_sections_trigger AFTER INSERT OR DELETE OR UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: homepage_widgets audit_homepage_widgets_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_homepage_widgets_trigger AFTER INSERT OR DELETE OR UPDATE ON public.homepage_widgets FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: pages audit_pages_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_pages_trigger AFTER INSERT OR DELETE OR UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: posts audit_posts_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_posts_trigger AFTER INSERT OR DELETE OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


--
-- Name: events events_before_write_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER events_before_write_trigger BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.events_before_write();


--
-- Name: events events_enforce_featured_rules_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER events_enforce_featured_rules_trigger BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.events_enforce_featured_rules();


--
-- Name: user_profiles on_user_profile_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_user_profile_created AFTER INSERT ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_role();


--
-- Name: scholarships scholarships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER scholarships_updated_at BEFORE UPDATE ON public.scholarships FOR EACH ROW EXECUTE FUNCTION public.set_scholarships_updated_at();


--
-- Name: sports_achievements trg_sports_ach_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sports_ach_updated_at BEFORE UPDATE ON public.sports_achievements FOR EACH ROW EXECUTE FUNCTION public.update_sports_updated_at();


--
-- Name: sports trg_sports_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sports_updated_at BEFORE UPDATE ON public.sports FOR EACH ROW EXECUTE FUNCTION public.update_sports_updated_at();


--
-- Name: accreditations update_accreditations_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_accreditations_modtime BEFORE UPDATE ON public.accreditations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: achievements update_achievements_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_achievements_modtime BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cells update_cells_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cells_modtime BEFORE UPDATE ON public.cells FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: centers update_centers_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_centers_modtime BEFORE UPDATE ON public.centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: colleges update_colleges_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_colleges_modtime BEFORE UPDATE ON public.colleges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: committees update_committees_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_committees_modtime BEFORE UPDATE ON public.committees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: content_categories update_content_categories_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_content_categories_modtime BEFORE UPDATE ON public.content_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: courses update_courses_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_courses_modtime BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: departments update_departments_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: designations update_designations_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_designations_modtime BEFORE UPDATE ON public.designations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: downloads update_downloads_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_downloads_modtime BEFORE UPDATE ON public.downloads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_events_modtime BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: facilities update_facilities_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_facilities_modtime BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: staff_department_assignments update_faculty_dept_assignments_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_faculty_dept_assignments_modtime BEFORE UPDATE ON public.staff_department_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: gallery_albums update_gallery_albums_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_gallery_albums_modtime BEFORE UPDATE ON public.gallery_albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: gallery_media update_gallery_media_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_gallery_media_modtime BEFORE UPDATE ON public.gallery_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: homepage_items update_homepage_items_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_homepage_items_modtime BEFORE UPDATE ON public.homepage_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: homepage_sections update_homepage_sections_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_homepage_sections_modtime BEFORE UPDATE ON public.homepage_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: homepage_widgets update_homepage_widgets_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_homepage_widgets_modtime BEFORE UPDATE ON public.homepage_widgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inquiry_forms update_inquiry_forms_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inquiry_forms_modtime BEFORE UPDATE ON public.inquiry_forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inquiry_submissions update_inquiry_submissions_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inquiry_submissions_modtime BEFORE UPDATE ON public.inquiry_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: institutes update_institutes_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_institutes_modtime BEFORE UPDATE ON public.institutes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: media_files update_media_files_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_media_files_modtime BEFORE UPDATE ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: media_folders update_media_folders_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_media_folders_modtime BEFORE UPDATE ON public.media_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: menu_items update_menu_items_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_menu_items_modtime BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: menus update_menus_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_menus_modtime BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: mous update_mous_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_mous_modtime BEFORE UPDATE ON public.mous FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: pages update_pages_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_pages_modtime BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: permissions update_permissions_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_permissions_modtime BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: posts update_posts_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_posts_modtime BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_profiles update_profiles_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recruiters update_recruiters_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recruiters_modtime BEFORE UPDATE ON public.recruiters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: redirects update_redirects_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_redirects_modtime BEFORE UPDATE ON public.redirects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: roles update_roles_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: seo_metadata update_seo_metadata_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_seo_metadata_modtime BEFORE UPDATE ON public.seo_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: staff_profiles update_staff_profiles_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_staff_profiles_modtime BEFORE UPDATE ON public.staff_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: student_clubs update_student_clubs_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_student_clubs_modtime BEFORE UPDATE ON public.student_clubs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: testimonials update_testimonials_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_testimonials_modtime BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: trusts update_trusts_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_trusts_modtime BEFORE UPDATE ON public.trusts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_roles update_user_roles_modtime; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_roles_modtime BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: accreditations accreditations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: accreditations accreditations_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: accreditations accreditations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accreditations
    ADD CONSTRAINT accreditations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: achievements achievements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: achievements achievements_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: achievements achievements_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: achievements achievements_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: app_settings app_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: board_members board_members_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id);


--
-- Name: board_members board_members_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id);


--
-- Name: board_members board_members_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id);


--
-- Name: board_members board_members_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.board_members
    ADD CONSTRAINT board_members_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id);


--
-- Name: cells cells_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cells
    ADD CONSTRAINT cells_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: centers centers_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.centers
    ADD CONSTRAINT centers_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: centers centers_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.centers
    ADD CONSTRAINT centers_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON DELETE CASCADE;


--
-- Name: club_events club_events_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_events
    ADD CONSTRAINT club_events_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.student_clubs(id);


--
-- Name: club_events club_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_events
    ADD CONSTRAINT club_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id);


--
-- Name: club_events club_events_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_events
    ADD CONSTRAINT club_events_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id);


--
-- Name: club_events club_events_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.club_events
    ADD CONSTRAINT club_events_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id);


--
-- Name: colleges colleges_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: colleges colleges_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: colleges colleges_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON DELETE CASCADE;


--
-- Name: colleges colleges_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: committees committees_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: content_categories content_categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT content_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: content_categories content_categories_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT content_categories_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: content_categories content_categories_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_categories
    ADD CONSTRAINT content_categories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: department_activities department_activities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id);


--
-- Name: department_activities department_activities_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id);


--
-- Name: department_activities department_activities_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: department_activities department_activities_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id);


--
-- Name: departments departments_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: departments departments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: departments departments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: departments departments_head_of_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_head_of_department_id_fkey FOREIGN KEY (head_of_department_id) REFERENCES public.staff_profiles(id) ON DELETE SET NULL;


--
-- Name: departments departments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: designations designations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: designations designations_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: designations designations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: downloads downloads_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.downloads
    ADD CONSTRAINT downloads_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: downloads downloads_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.downloads
    ADD CONSTRAINT downloads_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: downloads downloads_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.downloads
    ADD CONSTRAINT downloads_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: events events_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id);


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: events events_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: events events_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: events events_featured_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_featured_by_fkey FOREIGN KEY (featured_by) REFERENCES public.user_profiles(id);


--
-- Name: events events_seo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_seo_id_fkey FOREIGN KEY (seo_id) REFERENCES public.seo_metadata(id) ON DELETE SET NULL;


--
-- Name: events events_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: facilities facilities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: facilities facilities_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: facilities facilities_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.facilities(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: gallery_albums gallery_albums_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: gallery_albums gallery_albums_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: gallery_albums gallery_albums_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: gallery_albums gallery_albums_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_albums
    ADD CONSTRAINT gallery_albums_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: gallery_media gallery_media_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_media
    ADD CONSTRAINT gallery_media_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.gallery_albums(id) ON DELETE CASCADE;


--
-- Name: gallery_media gallery_media_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_media
    ADD CONSTRAINT gallery_media_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: gallery_media gallery_media_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_media
    ADD CONSTRAINT gallery_media_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: gallery_media gallery_media_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_media
    ADD CONSTRAINT gallery_media_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_items homepage_items_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_items
    ADD CONSTRAINT homepage_items_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: homepage_items homepage_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_items
    ADD CONSTRAINT homepage_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_items homepage_items_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_items
    ADD CONSTRAINT homepage_items_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_items homepage_items_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_items
    ADD CONSTRAINT homepage_items_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: homepage_items homepage_items_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_items
    ADD CONSTRAINT homepage_items_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_sections homepage_sections_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_sections
    ADD CONSTRAINT homepage_sections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_sections homepage_sections_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_sections
    ADD CONSTRAINT homepage_sections_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_sections homepage_sections_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_sections
    ADD CONSTRAINT homepage_sections_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: homepage_sections homepage_sections_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_sections
    ADD CONSTRAINT homepage_sections_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_widgets homepage_widgets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_widgets
    ADD CONSTRAINT homepage_widgets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_widgets homepage_widgets_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_widgets
    ADD CONSTRAINT homepage_widgets_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: homepage_widgets homepage_widgets_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_widgets
    ADD CONSTRAINT homepage_widgets_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.homepage_sections(id) ON DELETE CASCADE;


--
-- Name: homepage_widgets homepage_widgets_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homepage_widgets
    ADD CONSTRAINT homepage_widgets_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: inquiry_forms inquiry_forms_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_forms
    ADD CONSTRAINT inquiry_forms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: inquiry_forms inquiry_forms_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_forms
    ADD CONSTRAINT inquiry_forms_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: inquiry_forms inquiry_forms_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_forms
    ADD CONSTRAINT inquiry_forms_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: inquiry_submissions inquiry_submissions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_submissions
    ADD CONSTRAINT inquiry_submissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: inquiry_submissions inquiry_submissions_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_submissions
    ADD CONSTRAINT inquiry_submissions_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: inquiry_submissions inquiry_submissions_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_submissions
    ADD CONSTRAINT inquiry_submissions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.inquiry_forms(id) ON DELETE CASCADE;


--
-- Name: inquiry_submissions inquiry_submissions_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_submissions
    ADD CONSTRAINT inquiry_submissions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: institutes institutes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: institutes institutes_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: institutes institutes_trust_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_trust_id_fkey FOREIGN KEY (trust_id) REFERENCES public.trusts(id) ON DELETE CASCADE;


--
-- Name: institutes institutes_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: media_files media_files_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: media_files media_files_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: media_files media_files_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: media_files media_files_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.media_folders(id) ON DELETE SET NULL;


--
-- Name: media_files media_files_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: media_folders media_folders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: media_folders media_folders_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: media_folders media_folders_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: media_folders media_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media_folders(id) ON DELETE SET NULL;


--
-- Name: media_folders media_folders_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: menus menus_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: menus menus_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: menus menus_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: mous mous_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mous
    ADD CONSTRAINT mous_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: mous mous_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mous
    ADD CONSTRAINT mous_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: mous mous_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mous
    ADD CONSTRAINT mous_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: pages pages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: pages pages_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: pages pages_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE SET NULL;


--
-- Name: pages pages_seo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_seo_id_fkey FOREIGN KEY (seo_id) REFERENCES public.seo_metadata(id) ON DELETE SET NULL;


--
-- Name: pages pages_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: permissions permissions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: permissions permissions_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: permissions permissions_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: placed_students placed_students_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placed_students
    ADD CONSTRAINT placed_students_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: placed_students placed_students_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.placed_students
    ADD CONSTRAINT placed_students_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: posts posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.content_categories(id) ON DELETE SET NULL;


--
-- Name: posts posts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: posts posts_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: posts posts_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: posts posts_seo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_seo_id_fkey FOREIGN KEY (seo_id) REFERENCES public.seo_metadata(id) ON DELETE SET NULL;


--
-- Name: posts posts_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: recruiters recruiters_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: recruiters recruiters_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: recruiters recruiters_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: recruiters recruiters_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recruiters
    ADD CONSTRAINT recruiters_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: redirects redirects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: redirects redirects_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: redirects redirects_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.redirects
    ADD CONSTRAINT redirects_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: roles roles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: roles roles_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: roles roles_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: scholarships scholarships_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: scholarships scholarships_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: seo_metadata seo_metadata_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: seo_metadata seo_metadata_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: seo_metadata seo_metadata_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seo_metadata
    ADD CONSTRAINT seo_metadata_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: sports_achievements sports_achievements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_achievements
    ADD CONSTRAINT sports_achievements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: sports_achievements sports_achievements_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_achievements
    ADD CONSTRAINT sports_achievements_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id);


--
-- Name: sports_achievements sports_achievements_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_achievements
    ADD CONSTRAINT sports_achievements_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE SET NULL;


--
-- Name: sports_achievements sports_achievements_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_achievements
    ADD CONSTRAINT sports_achievements_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: sports sports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: sports sports_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id);


--
-- Name: sports sports_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT sports_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: staff_achievements staff_achievements_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_achievements
    ADD CONSTRAINT staff_achievements_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES auth.users(id);


--
-- Name: staff_achievements staff_achievements_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_achievements
    ADD CONSTRAINT staff_achievements_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff_profiles(id) ON DELETE CASCADE;


--
-- Name: staff_department_assignments staff_department_assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT staff_department_assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: staff_department_assignments staff_department_assignments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT staff_department_assignments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: staff_department_assignments staff_department_assignments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT staff_department_assignments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: staff_department_assignments staff_department_assignments_designation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT staff_department_assignments_designation_id_fkey FOREIGN KEY (designation_id) REFERENCES public.designations(id) ON DELETE SET NULL;


--
-- Name: staff_department_assignments staff_department_assignments_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT staff_department_assignments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff_profiles(id) ON DELETE CASCADE;


--
-- Name: staff_department_assignments staff_department_assignments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_department_assignments
    ADD CONSTRAINT staff_department_assignments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: staff_profiles staff_profiles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: staff_profiles staff_profiles_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: staff_profiles staff_profiles_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: staff_profiles staff_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: student_clubs student_clubs_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_clubs
    ADD CONSTRAINT student_clubs_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES public.staff_profiles(id) ON DELETE SET NULL;


--
-- Name: student_clubs student_clubs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_clubs
    ADD CONSTRAINT student_clubs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: student_clubs student_clubs_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_clubs
    ADD CONSTRAINT student_clubs_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: student_clubs student_clubs_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_clubs
    ADD CONSTRAINT student_clubs_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: student_clubs student_clubs_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_clubs
    ADD CONSTRAINT student_clubs_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: testimonials testimonials_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: testimonials testimonials_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: testimonials testimonials_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: trusts trusts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trusts
    ADD CONSTRAINT trusts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: trusts trusts_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trusts
    ADD CONSTRAINT trusts_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: trusts trusts_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trusts
    ADD CONSTRAINT trusts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: user_profiles user_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_trust_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_trust_id_fkey FOREIGN KEY (trust_id) REFERENCES public.trusts(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: scholarships Admins can manage scholarships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage scholarships" ON public.scholarships USING ((EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.code = 'admin'::text)))));


--
-- Name: accreditations Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.accreditations FOR SELECT TO anon USING (true);


--
-- Name: achievements Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.achievements FOR SELECT TO anon USING (true);


--
-- Name: board_members Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.board_members FOR SELECT TO anon USING (true);


--
-- Name: cells Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.cells FOR SELECT TO anon USING (true);


--
-- Name: centers Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.centers FOR SELECT TO anon USING (true);


--
-- Name: club_events Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.club_events FOR SELECT USING (true);


--
-- Name: committees Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.committees FOR SELECT TO anon USING (true);


--
-- Name: content_categories Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.content_categories FOR SELECT TO anon USING (true);


--
-- Name: designations Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.designations FOR SELECT TO anon USING (true);


--
-- Name: downloads Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.downloads FOR SELECT TO anon USING (true);


--
-- Name: facilities Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.facilities FOR SELECT TO anon USING (true);


--
-- Name: gallery_albums Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.gallery_albums FOR SELECT TO anon USING (true);


--
-- Name: gallery_media Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.gallery_media FOR SELECT TO anon USING (true);


--
-- Name: homepage_sections Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.homepage_sections FOR SELECT TO anon USING (true);


--
-- Name: homepage_widgets Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.homepage_widgets FOR SELECT TO anon USING (true);


--
-- Name: mous Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.mous FOR SELECT TO anon USING (true);


--
-- Name: pages Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.pages FOR SELECT TO anon USING (true);


--
-- Name: posts Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.posts FOR SELECT TO anon USING (true);


--
-- Name: seo_metadata Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.seo_metadata FOR SELECT TO anon USING (true);


--
-- Name: staff_achievements Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.staff_achievements FOR SELECT TO anon USING ((deleted_at IS NULL));


--
-- Name: staff_department_assignments Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.staff_department_assignments FOR SELECT TO anon USING (true);


--
-- Name: student_clubs Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.student_clubs FOR SELECT TO anon USING (true);


--
-- Name: testimonials Anon SELECT; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon SELECT" ON public.testimonials FOR SELECT TO anon USING (true);


--
-- Name: colleges Anon read colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon read colleges" ON public.colleges FOR SELECT TO anon USING (true);


--
-- Name: courses Anon read courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon read courses" ON public.courses FOR SELECT TO anon USING (true);


--
-- Name: department_activities Anon read department_activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon read department_activities" ON public.department_activities FOR SELECT TO anon USING (true);


--
-- Name: departments Anon read departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon read departments" ON public.departments FOR SELECT TO anon USING (true);


--
-- Name: staff_profiles Anon read staff_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anon read staff_profiles" ON public.staff_profiles FOR SELECT TO anon USING (true);


--
-- Name: trusts Auth CRUD; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth CRUD" ON public.trusts TO authenticated USING (true) WITH CHECK (true);


--
-- Name: audit_logs Authenticated insert own audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated insert own audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: accreditations Authenticated read accreditations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read accreditations" ON public.accreditations FOR SELECT TO authenticated USING (true);


--
-- Name: achievements Authenticated read achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read achievements" ON public.achievements FOR SELECT TO authenticated USING (true);


--
-- Name: board_members Authenticated read board_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read board_members" ON public.board_members FOR SELECT TO authenticated USING (true);


--
-- Name: cells Authenticated read cells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read cells" ON public.cells FOR SELECT TO authenticated USING (true);


--
-- Name: club_events Authenticated read club_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read club_events" ON public.club_events FOR SELECT TO authenticated USING (true);


--
-- Name: committees Authenticated read committees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read committees" ON public.committees FOR SELECT TO authenticated USING (true);


--
-- Name: content_categories Authenticated read content_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read content_categories" ON public.content_categories FOR SELECT TO authenticated USING (true);


--
-- Name: downloads Authenticated read downloads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read downloads" ON public.downloads FOR SELECT TO authenticated USING (true);


--
-- Name: gallery_albums Authenticated read gallery_albums; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read gallery_albums" ON public.gallery_albums FOR SELECT TO authenticated USING (true);


--
-- Name: gallery_media Authenticated read gallery_media; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read gallery_media" ON public.gallery_media FOR SELECT TO authenticated USING (true);


--
-- Name: homepage_sections Authenticated read homepage_sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read homepage_sections" ON public.homepage_sections FOR SELECT TO authenticated USING (true);


--
-- Name: homepage_widgets Authenticated read homepage_widgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read homepage_widgets" ON public.homepage_widgets FOR SELECT TO authenticated USING (true);


--
-- Name: media_files Authenticated read media_files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read media_files" ON public.media_files FOR SELECT TO authenticated USING (true);


--
-- Name: media_folders Authenticated read media_folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read media_folders" ON public.media_folders FOR SELECT TO authenticated USING (true);


--
-- Name: menu_items Authenticated read menu_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read menu_items" ON public.menu_items FOR SELECT TO authenticated USING (true);


--
-- Name: mous Authenticated read mous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read mous" ON public.mous FOR SELECT TO authenticated USING (true);


--
-- Name: pages Authenticated read pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read pages" ON public.pages FOR SELECT TO authenticated USING (true);


--
-- Name: permissions Authenticated read permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);


--
-- Name: posts Authenticated read posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read posts" ON public.posts FOR SELECT TO authenticated USING (true);


--
-- Name: redirects Authenticated read redirects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read redirects" ON public.redirects FOR SELECT TO authenticated USING (true);


--
-- Name: role_permissions Authenticated read role_permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (true);


--
-- Name: seo_metadata Authenticated read seo_metadata; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read seo_metadata" ON public.seo_metadata FOR SELECT TO authenticated USING (true);


--
-- Name: student_clubs Authenticated read student_clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read student_clubs" ON public.student_clubs FOR SELECT TO authenticated USING (true);


--
-- Name: testimonials Authenticated read testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read testimonials" ON public.testimonials FOR SELECT TO authenticated USING (true);


--
-- Name: staff_achievements Authenticated users can read staff_achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read staff_achievements" ON public.staff_achievements FOR SELECT TO authenticated USING ((deleted_at IS NULL));


--
-- Name: sports Global admin write sports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global admin write sports" ON public.sports TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: app_settings Global admins can write app_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global admins can write app_settings" ON public.app_settings TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (ur.status = 'published'::public.content_status) AND (r.code = 'admin'::text) AND (ur.scope_type = 'global'::public.scope_level))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((r.id = ur.role_id)))
  WHERE ((ur.user_id = auth.uid()) AND (ur.status = 'published'::public.content_status) AND (r.code = 'admin'::text) AND (ur.scope_type = 'global'::public.scope_level)))));


--
-- Name: achievements Global delete achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete achievements" ON public.achievements FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: audit_logs Global delete audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete audit_logs" ON public.audit_logs FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: board_members Global delete board_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete board_members" ON public.board_members FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: events Global delete events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete events" ON public.events FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: gallery_albums Global delete gallery_albums; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete gallery_albums" ON public.gallery_albums FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: homepage_items Global delete homepage_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete homepage_items" ON public.homepage_items FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: homepage_sections Global delete homepage_sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete homepage_sections" ON public.homepage_sections FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: inquiry_submissions Global delete inquiry_submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete inquiry_submissions" ON public.inquiry_submissions FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: media_files Global delete media_files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete media_files" ON public.media_files FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: media_folders Global delete media_folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete media_folders" ON public.media_folders FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: placed_students Global delete placed_students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete placed_students" ON public.placed_students FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: posts Global delete posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete posts" ON public.posts FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: user_profiles Global delete profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete profiles" ON public.user_profiles FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: recruiters Global delete recruiters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete recruiters" ON public.recruiters FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: student_clubs Global delete student_clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global delete student_clubs" ON public.student_clubs FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: achievements Global insert achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert achievements" ON public.achievements FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: board_members Global insert board_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert board_members" ON public.board_members FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: events Global insert events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: gallery_albums Global insert gallery_albums; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert gallery_albums" ON public.gallery_albums FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: homepage_items Global insert homepage_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert homepage_items" ON public.homepage_items FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: homepage_sections Global insert homepage_sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert homepage_sections" ON public.homepage_sections FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: media_files Global insert media_files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert media_files" ON public.media_files FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: media_folders Global insert media_folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert media_folders" ON public.media_folders FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: placed_students Global insert placed_students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert placed_students" ON public.placed_students FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: posts Global insert posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: user_profiles Global insert profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert profiles" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: recruiters Global insert recruiters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert recruiters" ON public.recruiters FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: student_clubs Global insert student_clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global insert student_clubs" ON public.student_clubs FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: audit_logs Global read audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_global_admin());


--
-- Name: inquiry_submissions Global read inquiry_submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global read inquiry_submissions" ON public.inquiry_submissions FOR SELECT TO authenticated USING (public.is_global_admin());


--
-- Name: achievements Global update achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update achievements" ON public.achievements FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: audit_logs Global update audit_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update audit_logs" ON public.audit_logs FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: board_members Global update board_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update board_members" ON public.board_members FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: events Global update events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update events" ON public.events FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: gallery_albums Global update gallery_albums; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update gallery_albums" ON public.gallery_albums FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: homepage_items Global update homepage_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update homepage_items" ON public.homepage_items FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: homepage_sections Global update homepage_sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update homepage_sections" ON public.homepage_sections FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: inquiry_submissions Global update inquiry_submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update inquiry_submissions" ON public.inquiry_submissions FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: media_files Global update media_files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update media_files" ON public.media_files FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: media_folders Global update media_folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update media_folders" ON public.media_folders FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: placed_students Global update placed_students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update placed_students" ON public.placed_students FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: posts Global update posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update posts" ON public.posts FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: recruiters Global update recruiters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update recruiters" ON public.recruiters FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: student_clubs Global update student_clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global update student_clubs" ON public.student_clubs FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: accreditations Global write accreditations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write accreditations" ON public.accreditations TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: club_events Global write club_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write club_events" ON public.club_events TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: content_categories Global write content_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write content_categories" ON public.content_categories TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: designations Global write designations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write designations" ON public.designations TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: downloads Global write downloads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write downloads" ON public.downloads TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: gallery_media Global write gallery_media; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write gallery_media" ON public.gallery_media TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: homepage_widgets Global write homepage_widgets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write homepage_widgets" ON public.homepage_widgets TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: inquiry_forms Global write inquiry_forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write inquiry_forms" ON public.inquiry_forms TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: menu_items Global write menu_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write menu_items" ON public.menu_items TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: menus Global write menus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write menus" ON public.menus TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: mous Global write mous; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write mous" ON public.mous TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: pages Global write pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write pages" ON public.pages TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: permissions Global write permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write permissions" ON public.permissions TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: placement_cells Global write placement_cells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write placement_cells" ON public.placement_cells TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: redirects Global write redirects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write redirects" ON public.redirects TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: role_permissions Global write role_permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write role_permissions" ON public.role_permissions TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: seo_metadata Global write seo_metadata; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write seo_metadata" ON public.seo_metadata TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: testimonials Global write testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global write testimonials" ON public.testimonials TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: inquiry_submissions Public insert inquiry_submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public insert inquiry_submissions" ON public.inquiry_submissions FOR INSERT WITH CHECK (true);


--
-- Name: app_settings Public read app_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);


--
-- Name: designations Public read designations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read designations" ON public.designations FOR SELECT USING (true);


--
-- Name: events Public read events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);


--
-- Name: homepage_items Public read homepage_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read homepage_items" ON public.homepage_items FOR SELECT USING (true);


--
-- Name: inquiry_forms Public read inquiry_forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read inquiry_forms" ON public.inquiry_forms FOR SELECT TO authenticated, anon USING (((status = 'published'::public.content_status) AND (deleted_at IS NULL)));


--
-- Name: institutes Public read institutes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read institutes" ON public.institutes FOR SELECT USING (true);


--
-- Name: menu_items Public read menu_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read menu_items" ON public.menu_items FOR SELECT USING (true);


--
-- Name: menus Public read menus; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read menus" ON public.menus FOR SELECT USING (true);


--
-- Name: placed_students Public read placed_students; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read placed_students" ON public.placed_students FOR SELECT USING ((status = 'published'::text));


--
-- Name: placement_cells Public read placement_cells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read placement_cells" ON public.placement_cells FOR SELECT TO authenticated, anon USING (((status = 'published'::public.content_status) AND (deleted_at IS NULL)));


--
-- Name: recruiters Public read recruiters; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read recruiters" ON public.recruiters FOR SELECT USING (true);


--
-- Name: trusts Public read trusts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read trusts" ON public.trusts FOR SELECT USING (true);


--
-- Name: user_profiles Read own or global profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Read own or global profile" ON public.user_profiles FOR SELECT TO authenticated USING (((id = auth.uid()) OR public.is_global_admin()));


--
-- Name: scholarships Scholarships are publicly readable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scholarships are publicly readable" ON public.scholarships FOR SELECT USING ((status = 'published'::text));


--
-- Name: cells Scoped delete cells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete cells" ON public.cells FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid));


--
-- Name: centers Scoped delete centers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete centers" ON public.centers FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, institute_id, college_id, NULL::uuid));


--
-- Name: colleges Scoped delete colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete colleges" ON public.colleges FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, institute_id, id, NULL::uuid));


--
-- Name: committees Scoped delete committees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete committees" ON public.committees FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid));


--
-- Name: courses Scoped delete courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete courses" ON public.courses FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = courses.department_id)), department_id));


--
-- Name: department_activities Scoped delete department_activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete department_activities" ON public.department_activities FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = department_activities.department_id)), department_id));


--
-- Name: departments Scoped delete departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete departments" ON public.departments FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, id));


--
-- Name: facilities Scoped delete facilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete facilities" ON public.facilities FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, institute_id, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = facilities.department_id)), department_id));


--
-- Name: institutes Scoped delete institutes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete institutes" ON public.institutes FOR DELETE USING (public.can_write_scoped_record(trust_id, id, NULL::uuid, NULL::uuid));


--
-- Name: staff_department_assignments Scoped delete staff_department_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete staff_department_assignments" ON public.staff_department_assignments FOR DELETE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = staff_department_assignments.department_id)), department_id));


--
-- Name: staff_profiles Scoped delete staff_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped delete staff_profiles" ON public.staff_profiles FOR DELETE USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.status = 'published'::public.content_status) AND (ur.deleted_at IS NULL) AND (ur.scope_type = 'global'::public.scope_level)))) OR (EXISTS ( SELECT 1
   FROM (public.staff_department_assignments sda
     JOIN public.departments d ON ((d.id = sda.department_id)))
  WHERE ((sda.staff_id = staff_profiles.id) AND (sda.deleted_at IS NULL) AND public.can_write_scoped_record(NULL::uuid, NULL::uuid, d.college_id, sda.department_id))))));


--
-- Name: cells Scoped insert cells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert cells" ON public.cells FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid));


--
-- Name: centers Scoped insert centers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert centers" ON public.centers FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, institute_id, college_id, NULL::uuid));


--
-- Name: colleges Scoped insert colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert colleges" ON public.colleges FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, institute_id, id, NULL::uuid));


--
-- Name: committees Scoped insert committees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert committees" ON public.committees FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid));


--
-- Name: courses Scoped insert courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert courses" ON public.courses FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = courses.department_id)), department_id));


--
-- Name: department_activities Scoped insert department_activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert department_activities" ON public.department_activities FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = department_activities.department_id)), department_id));


--
-- Name: departments Scoped insert departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert departments" ON public.departments FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, id));


--
-- Name: facilities Scoped insert facilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert facilities" ON public.facilities FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, institute_id, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = facilities.department_id)), department_id));


--
-- Name: institutes Scoped insert institutes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert institutes" ON public.institutes FOR INSERT WITH CHECK (public.can_write_scoped_record(trust_id, id, NULL::uuid, NULL::uuid));


--
-- Name: staff_department_assignments Scoped insert staff_department_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert staff_department_assignments" ON public.staff_department_assignments FOR INSERT WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = staff_department_assignments.department_id)), department_id));


--
-- Name: staff_profiles Scoped insert staff_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped insert staff_profiles" ON public.staff_profiles FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: centers Scoped read centers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read centers" ON public.centers FOR SELECT TO authenticated USING (public.can_write_scoped_record(NULL::uuid, institute_id, college_id, NULL::uuid));


--
-- Name: colleges Scoped read colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read colleges" ON public.colleges FOR SELECT TO authenticated USING (public.can_write_scoped_record(NULL::uuid, institute_id, id, NULL::uuid));


--
-- Name: courses Scoped read courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read courses" ON public.courses FOR SELECT TO authenticated USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = courses.department_id)), department_id));


--
-- Name: department_activities Scoped read department_activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read department_activities" ON public.department_activities FOR SELECT TO authenticated USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = department_activities.department_id)), department_id));


--
-- Name: departments Scoped read departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read departments" ON public.departments FOR SELECT TO authenticated USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, id));


--
-- Name: facilities Scoped read facilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read facilities" ON public.facilities FOR SELECT TO authenticated USING (public.can_write_scoped_record(NULL::uuid, institute_id, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = facilities.department_id)), department_id));


--
-- Name: staff_department_assignments Scoped read staff_department_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read staff_department_assignments" ON public.staff_department_assignments FOR SELECT TO authenticated USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = staff_department_assignments.department_id)), department_id));


--
-- Name: staff_profiles Scoped read staff_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped read staff_profiles" ON public.staff_profiles FOR SELECT TO authenticated USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.status = 'published'::public.content_status) AND (ur.deleted_at IS NULL) AND (ur.scope_type = 'global'::public.scope_level)))) OR (EXISTS ( SELECT 1
   FROM (public.staff_department_assignments sda
     JOIN public.departments d ON ((d.id = sda.department_id)))
  WHERE ((sda.staff_id = staff_profiles.id) AND (sda.deleted_at IS NULL) AND public.can_write_scoped_record(NULL::uuid, NULL::uuid, d.college_id, sda.department_id))))));


--
-- Name: cells Scoped update cells; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update cells" ON public.cells FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid));


--
-- Name: centers Scoped update centers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update centers" ON public.centers FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, institute_id, college_id, NULL::uuid)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, institute_id, college_id, NULL::uuid));


--
-- Name: colleges Scoped update colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update colleges" ON public.colleges FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, institute_id, id, NULL::uuid)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, institute_id, id, NULL::uuid));


--
-- Name: committees Scoped update committees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update committees" ON public.committees FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, NULL::uuid));


--
-- Name: courses Scoped update courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update courses" ON public.courses FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = courses.department_id)), department_id)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = courses.department_id)), department_id));


--
-- Name: department_activities Scoped update department_activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update department_activities" ON public.department_activities FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = department_activities.department_id)), department_id)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = department_activities.department_id)), department_id));


--
-- Name: departments Scoped update departments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update departments" ON public.departments FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, id)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, college_id, id));


--
-- Name: facilities Scoped update facilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update facilities" ON public.facilities FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, institute_id, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = facilities.department_id)), department_id)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, institute_id, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = facilities.department_id)), department_id));


--
-- Name: institutes Scoped update institutes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update institutes" ON public.institutes FOR UPDATE USING (public.can_write_scoped_record(trust_id, id, NULL::uuid, NULL::uuid)) WITH CHECK (public.can_write_scoped_record(trust_id, id, NULL::uuid, NULL::uuid));


--
-- Name: staff_department_assignments Scoped update staff_department_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update staff_department_assignments" ON public.staff_department_assignments FOR UPDATE USING (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = staff_department_assignments.department_id)), department_id)) WITH CHECK (public.can_write_scoped_record(NULL::uuid, NULL::uuid, ( SELECT d.college_id
   FROM public.departments d
  WHERE (d.id = staff_department_assignments.department_id)), department_id));


--
-- Name: staff_profiles Scoped update staff_profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped update staff_profiles" ON public.staff_profiles FOR UPDATE USING (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.status = 'published'::public.content_status) AND (ur.deleted_at IS NULL) AND (ur.scope_type = 'global'::public.scope_level)))) OR (EXISTS ( SELECT 1
   FROM (public.staff_department_assignments sda
     JOIN public.departments d ON ((d.id = sda.department_id)))
  WHERE ((sda.staff_id = staff_profiles.id) AND (sda.deleted_at IS NULL) AND public.can_write_scoped_record(NULL::uuid, NULL::uuid, d.college_id, sda.department_id)))))) WITH CHECK (((created_by = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.status = 'published'::public.content_status) AND (ur.deleted_at IS NULL) AND (ur.scope_type = 'global'::public.scope_level)))) OR (EXISTS ( SELECT 1
   FROM (public.staff_department_assignments sda
     JOIN public.departments d ON ((d.id = sda.department_id)))
  WHERE ((sda.staff_id = staff_profiles.id) AND (sda.deleted_at IS NULL) AND public.can_write_scoped_record(NULL::uuid, NULL::uuid, d.college_id, sda.department_id))))));


--
-- Name: staff_achievements Scoped write staff_achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Scoped write staff_achievements" ON public.staff_achievements TO authenticated USING ((public.is_global_admin() OR (EXISTS ( SELECT 1
   FROM (public.staff_department_assignments sda
     JOIN public.departments d ON ((d.id = sda.department_id)))
  WHERE ((sda.staff_id = staff_achievements.staff_id) AND (sda.deleted_at IS NULL) AND public.can_write_scoped_record(NULL::uuid, NULL::uuid, d.college_id, sda.department_id)))))) WITH CHECK ((public.is_global_admin() OR (EXISTS ( SELECT 1
   FROM (public.staff_department_assignments sda
     JOIN public.departments d ON ((d.id = sda.department_id)))
  WHERE ((sda.staff_id = staff_achievements.staff_id) AND (sda.deleted_at IS NULL) AND public.can_write_scoped_record(NULL::uuid, NULL::uuid, d.college_id, sda.department_id))))));


--
-- Name: user_profiles Update own or global profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Update own or global profile" ON public.user_profiles FOR UPDATE TO authenticated USING (((id = auth.uid()) OR public.is_global_admin())) WITH CHECK (((id = auth.uid()) OR public.is_global_admin()));


--
-- Name: accreditations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.accreditations ENABLE ROW LEVEL SECURITY;

--
-- Name: achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: app_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: board_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

--
-- Name: cells; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;

--
-- Name: centers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

--
-- Name: club_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;

--
-- Name: colleges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

--
-- Name: committees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

--
-- Name: content_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: department_activities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.department_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: designations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;

--
-- Name: downloads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: facilities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery_albums; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery_media; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

--
-- Name: homepage_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.homepage_items ENABLE ROW LEVEL SECURITY;

--
-- Name: homepage_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: homepage_widgets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.homepage_widgets ENABLE ROW LEVEL SECURITY;

--
-- Name: inquiry_forms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inquiry_forms ENABLE ROW LEVEL SECURITY;

--
-- Name: inquiry_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inquiry_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: institutes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

--
-- Name: media_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

--
-- Name: media_folders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: menus; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

--
-- Name: mous; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mous ENABLE ROW LEVEL SECURITY;

--
-- Name: pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: placed_students; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placed_students ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_cells; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.placement_cells ENABLE ROW LEVEL SECURITY;

--
-- Name: posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

--
-- Name: recruiters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

--
-- Name: redirects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

--
-- Name: role_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: roles roles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY roles_select ON public.roles FOR SELECT TO authenticated USING (true);


--
-- Name: roles roles_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY roles_write ON public.roles TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: scholarships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

--
-- Name: seo_metadata; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

--
-- Name: sports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

--
-- Name: sports_achievements sports_ach_admin_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sports_ach_admin_all ON public.sports_achievements USING ((auth.uid() IS NOT NULL)) WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: sports_achievements sports_ach_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sports_ach_public_read ON public.sports_achievements FOR SELECT USING (((deleted_at IS NULL) AND (status = 'published'::text) AND (is_active = true)));


--
-- Name: sports_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: sports sports_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sports_public_read ON public.sports FOR SELECT USING (((deleted_at IS NULL) AND (status = 'published'::text) AND (is_active = true)));


--
-- Name: staff_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_department_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_department_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: student_clubs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_clubs ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: trusts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trusts ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles user_roles_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_roles_delete ON public.user_roles FOR DELETE TO authenticated USING (public.is_global_admin());


--
-- Name: user_roles user_roles_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_roles_insert ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_global_admin());


--
-- Name: user_roles user_roles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_roles_select ON public.user_roles FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_global_admin()));


--
-- Name: user_roles user_roles_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY user_roles_update ON public.user_roles FOR UPDATE TO authenticated USING (public.is_global_admin()) WITH CHECK (public.is_global_admin());


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO "databasus-32844a54";
GRANT USAGE ON SCHEMA public TO "databasus-d9dbcfa9";


--
-- Name: FUNCTION can_write_event(p_scope_type public.scope_level, p_college_id uuid, p_department_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.can_write_event(p_scope_type public.scope_level, p_college_id uuid, p_department_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_write_event(p_scope_type public.scope_level, p_college_id uuid, p_department_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_write_event(p_scope_type public.scope_level, p_college_id uuid, p_department_id uuid) TO service_role;


--
-- Name: FUNCTION can_write_scoped_record(p_trust_id uuid, p_institute_id uuid, p_college_id uuid, p_department_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.can_write_scoped_record(p_trust_id uuid, p_institute_id uuid, p_college_id uuid, p_department_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_write_scoped_record(p_trust_id uuid, p_institute_id uuid, p_college_id uuid, p_department_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_write_scoped_record(p_trust_id uuid, p_institute_id uuid, p_college_id uuid, p_department_id uuid) TO service_role;


--
-- Name: FUNCTION current_user_is_dept_admin_for(target_dept_id uuid); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.current_user_is_dept_admin_for(target_dept_id uuid) TO anon;
GRANT ALL ON FUNCTION public.current_user_is_dept_admin_for(target_dept_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.current_user_is_dept_admin_for(target_dept_id uuid) TO service_role;


--
-- Name: FUNCTION events_before_write(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.events_before_write() TO anon;
GRANT ALL ON FUNCTION public.events_before_write() TO authenticated;
GRANT ALL ON FUNCTION public.events_before_write() TO service_role;


--
-- Name: FUNCTION events_enforce_featured_rules(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.events_enforce_featured_rules() TO anon;
GRANT ALL ON FUNCTION public.events_enforce_featured_rules() TO authenticated;
GRANT ALL ON FUNCTION public.events_enforce_featured_rules() TO service_role;


--
-- Name: FUNCTION get_table_schema_info(target_table text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.get_table_schema_info(target_table text) TO anon;
GRANT ALL ON FUNCTION public.get_table_schema_info(target_table text) TO authenticated;
GRANT ALL ON FUNCTION public.get_table_schema_info(target_table text) TO service_role;


--
-- Name: FUNCTION handle_first_user_role(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.handle_first_user_role() TO anon;
GRANT ALL ON FUNCTION public.handle_first_user_role() TO authenticated;
GRANT ALL ON FUNCTION public.handle_first_user_role() TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION is_global_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_global_admin() TO anon;
GRANT ALL ON FUNCTION public.is_global_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_global_admin() TO service_role;


--
-- Name: FUNCTION process_audit_log(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.process_audit_log() TO anon;
GRANT ALL ON FUNCTION public.process_audit_log() TO authenticated;
GRANT ALL ON FUNCTION public.process_audit_log() TO service_role;


--
-- Name: FUNCTION set_scholarships_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_scholarships_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_scholarships_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_scholarships_updated_at() TO service_role;


--
-- Name: FUNCTION update_sports_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_sports_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_sports_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_sports_updated_at() TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: TABLE accreditations; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.accreditations TO anon;
GRANT ALL ON TABLE public.accreditations TO authenticated;
GRANT ALL ON TABLE public.accreditations TO service_role;
GRANT SELECT ON TABLE public.accreditations TO "databasus-32844a54";
GRANT SELECT ON TABLE public.accreditations TO "databasus-d9dbcfa9";


--
-- Name: TABLE achievements; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.achievements TO anon;
GRANT ALL ON TABLE public.achievements TO authenticated;
GRANT ALL ON TABLE public.achievements TO service_role;
GRANT SELECT ON TABLE public.achievements TO "databasus-32844a54";
GRANT SELECT ON TABLE public.achievements TO "databasus-d9dbcfa9";


--
-- Name: TABLE app_settings; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.app_settings TO anon;
GRANT ALL ON TABLE public.app_settings TO authenticated;
GRANT ALL ON TABLE public.app_settings TO service_role;
GRANT SELECT ON TABLE public.app_settings TO "databasus-32844a54";
GRANT SELECT ON TABLE public.app_settings TO "databasus-d9dbcfa9";


--
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;
GRANT SELECT ON TABLE public.audit_logs TO "databasus-32844a54";
GRANT SELECT ON TABLE public.audit_logs TO "databasus-d9dbcfa9";


--
-- Name: TABLE board_members; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.board_members TO anon;
GRANT ALL ON TABLE public.board_members TO authenticated;
GRANT ALL ON TABLE public.board_members TO service_role;
GRANT SELECT ON TABLE public.board_members TO "databasus-32844a54";
GRANT SELECT ON TABLE public.board_members TO "databasus-d9dbcfa9";


--
-- Name: TABLE cells; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.cells TO anon;
GRANT ALL ON TABLE public.cells TO authenticated;
GRANT ALL ON TABLE public.cells TO service_role;
GRANT SELECT ON TABLE public.cells TO "databasus-32844a54";
GRANT SELECT ON TABLE public.cells TO "databasus-d9dbcfa9";


--
-- Name: TABLE centers; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.centers TO anon;
GRANT ALL ON TABLE public.centers TO authenticated;
GRANT ALL ON TABLE public.centers TO service_role;
GRANT SELECT ON TABLE public.centers TO "databasus-32844a54";
GRANT SELECT ON TABLE public.centers TO "databasus-d9dbcfa9";


--
-- Name: TABLE club_events; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.club_events TO anon;
GRANT ALL ON TABLE public.club_events TO authenticated;
GRANT ALL ON TABLE public.club_events TO service_role;
GRANT SELECT ON TABLE public.club_events TO "databasus-32844a54";
GRANT SELECT ON TABLE public.club_events TO "databasus-d9dbcfa9";


--
-- Name: TABLE colleges; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.colleges TO anon;
GRANT ALL ON TABLE public.colleges TO authenticated;
GRANT ALL ON TABLE public.colleges TO service_role;
GRANT SELECT ON TABLE public.colleges TO "databasus-32844a54";
GRANT SELECT ON TABLE public.colleges TO "databasus-d9dbcfa9";


--
-- Name: TABLE committees; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.committees TO anon;
GRANT ALL ON TABLE public.committees TO authenticated;
GRANT ALL ON TABLE public.committees TO service_role;
GRANT SELECT ON TABLE public.committees TO "databasus-32844a54";
GRANT SELECT ON TABLE public.committees TO "databasus-d9dbcfa9";


--
-- Name: TABLE content_categories; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.content_categories TO anon;
GRANT ALL ON TABLE public.content_categories TO authenticated;
GRANT ALL ON TABLE public.content_categories TO service_role;
GRANT SELECT ON TABLE public.content_categories TO "databasus-32844a54";
GRANT SELECT ON TABLE public.content_categories TO "databasus-d9dbcfa9";


--
-- Name: TABLE courses; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.courses TO anon;
GRANT ALL ON TABLE public.courses TO authenticated;
GRANT ALL ON TABLE public.courses TO service_role;
GRANT SELECT ON TABLE public.courses TO "databasus-32844a54";
GRANT SELECT ON TABLE public.courses TO "databasus-d9dbcfa9";


--
-- Name: TABLE department_activities; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.department_activities TO anon;
GRANT ALL ON TABLE public.department_activities TO authenticated;
GRANT ALL ON TABLE public.department_activities TO service_role;
GRANT SELECT ON TABLE public.department_activities TO "databasus-32844a54";
GRANT SELECT ON TABLE public.department_activities TO "databasus-d9dbcfa9";


--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.departments TO anon;
GRANT ALL ON TABLE public.departments TO authenticated;
GRANT ALL ON TABLE public.departments TO service_role;
GRANT SELECT ON TABLE public.departments TO "databasus-32844a54";
GRANT SELECT ON TABLE public.departments TO "databasus-d9dbcfa9";


--
-- Name: TABLE designations; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.designations TO anon;
GRANT ALL ON TABLE public.designations TO authenticated;
GRANT ALL ON TABLE public.designations TO service_role;
GRANT SELECT ON TABLE public.designations TO "databasus-32844a54";
GRANT SELECT ON TABLE public.designations TO "databasus-d9dbcfa9";


--
-- Name: TABLE downloads; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.downloads TO anon;
GRANT ALL ON TABLE public.downloads TO authenticated;
GRANT ALL ON TABLE public.downloads TO service_role;
GRANT SELECT ON TABLE public.downloads TO "databasus-32844a54";
GRANT SELECT ON TABLE public.downloads TO "databasus-d9dbcfa9";


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;
GRANT SELECT ON TABLE public.events TO "databasus-32844a54";
GRANT SELECT ON TABLE public.events TO "databasus-d9dbcfa9";


--
-- Name: TABLE facilities; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.facilities TO anon;
GRANT ALL ON TABLE public.facilities TO authenticated;
GRANT ALL ON TABLE public.facilities TO service_role;
GRANT SELECT ON TABLE public.facilities TO "databasus-32844a54";
GRANT SELECT ON TABLE public.facilities TO "databasus-d9dbcfa9";


--
-- Name: TABLE gallery_albums; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.gallery_albums TO anon;
GRANT ALL ON TABLE public.gallery_albums TO authenticated;
GRANT ALL ON TABLE public.gallery_albums TO service_role;
GRANT SELECT ON TABLE public.gallery_albums TO "databasus-32844a54";
GRANT SELECT ON TABLE public.gallery_albums TO "databasus-d9dbcfa9";


--
-- Name: TABLE gallery_media; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.gallery_media TO anon;
GRANT ALL ON TABLE public.gallery_media TO authenticated;
GRANT ALL ON TABLE public.gallery_media TO service_role;
GRANT SELECT ON TABLE public.gallery_media TO "databasus-32844a54";
GRANT SELECT ON TABLE public.gallery_media TO "databasus-d9dbcfa9";


--
-- Name: TABLE homepage_items; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.homepage_items TO anon;
GRANT ALL ON TABLE public.homepage_items TO authenticated;
GRANT ALL ON TABLE public.homepage_items TO service_role;
GRANT SELECT ON TABLE public.homepage_items TO "databasus-32844a54";
GRANT SELECT ON TABLE public.homepage_items TO "databasus-d9dbcfa9";


--
-- Name: TABLE homepage_sections; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.homepage_sections TO anon;
GRANT ALL ON TABLE public.homepage_sections TO authenticated;
GRANT ALL ON TABLE public.homepage_sections TO service_role;
GRANT SELECT ON TABLE public.homepage_sections TO "databasus-32844a54";
GRANT SELECT ON TABLE public.homepage_sections TO "databasus-d9dbcfa9";


--
-- Name: TABLE homepage_widgets; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.homepage_widgets TO anon;
GRANT ALL ON TABLE public.homepage_widgets TO authenticated;
GRANT ALL ON TABLE public.homepage_widgets TO service_role;
GRANT SELECT ON TABLE public.homepage_widgets TO "databasus-32844a54";
GRANT SELECT ON TABLE public.homepage_widgets TO "databasus-d9dbcfa9";


--
-- Name: TABLE inquiry_forms; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.inquiry_forms TO anon;
GRANT ALL ON TABLE public.inquiry_forms TO authenticated;
GRANT ALL ON TABLE public.inquiry_forms TO service_role;
GRANT SELECT ON TABLE public.inquiry_forms TO "databasus-32844a54";
GRANT SELECT ON TABLE public.inquiry_forms TO "databasus-d9dbcfa9";


--
-- Name: TABLE inquiry_submissions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.inquiry_submissions TO anon;
GRANT ALL ON TABLE public.inquiry_submissions TO authenticated;
GRANT ALL ON TABLE public.inquiry_submissions TO service_role;
GRANT SELECT ON TABLE public.inquiry_submissions TO "databasus-32844a54";
GRANT SELECT ON TABLE public.inquiry_submissions TO "databasus-d9dbcfa9";


--
-- Name: TABLE institutes; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.institutes TO anon;
GRANT ALL ON TABLE public.institutes TO authenticated;
GRANT ALL ON TABLE public.institutes TO service_role;
GRANT SELECT ON TABLE public.institutes TO "databasus-32844a54";
GRANT SELECT ON TABLE public.institutes TO "databasus-d9dbcfa9";


--
-- Name: TABLE media_files; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.media_files TO anon;
GRANT ALL ON TABLE public.media_files TO authenticated;
GRANT ALL ON TABLE public.media_files TO service_role;
GRANT SELECT ON TABLE public.media_files TO "databasus-32844a54";
GRANT SELECT ON TABLE public.media_files TO "databasus-d9dbcfa9";


--
-- Name: TABLE media_folders; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.media_folders TO anon;
GRANT ALL ON TABLE public.media_folders TO authenticated;
GRANT ALL ON TABLE public.media_folders TO service_role;
GRANT SELECT ON TABLE public.media_folders TO "databasus-32844a54";
GRANT SELECT ON TABLE public.media_folders TO "databasus-d9dbcfa9";


--
-- Name: TABLE menu_items; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.menu_items TO anon;
GRANT ALL ON TABLE public.menu_items TO authenticated;
GRANT ALL ON TABLE public.menu_items TO service_role;
GRANT SELECT ON TABLE public.menu_items TO "databasus-32844a54";
GRANT SELECT ON TABLE public.menu_items TO "databasus-d9dbcfa9";


--
-- Name: TABLE menus; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.menus TO anon;
GRANT ALL ON TABLE public.menus TO authenticated;
GRANT ALL ON TABLE public.menus TO service_role;
GRANT SELECT ON TABLE public.menus TO "databasus-32844a54";
GRANT SELECT ON TABLE public.menus TO "databasus-d9dbcfa9";


--
-- Name: TABLE mous; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.mous TO anon;
GRANT ALL ON TABLE public.mous TO authenticated;
GRANT ALL ON TABLE public.mous TO service_role;
GRANT SELECT ON TABLE public.mous TO "databasus-32844a54";
GRANT SELECT ON TABLE public.mous TO "databasus-d9dbcfa9";


--
-- Name: TABLE pages; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.pages TO anon;
GRANT ALL ON TABLE public.pages TO authenticated;
GRANT ALL ON TABLE public.pages TO service_role;
GRANT SELECT ON TABLE public.pages TO "databasus-32844a54";
GRANT SELECT ON TABLE public.pages TO "databasus-d9dbcfa9";


--
-- Name: TABLE permissions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.permissions TO anon;
GRANT ALL ON TABLE public.permissions TO authenticated;
GRANT ALL ON TABLE public.permissions TO service_role;
GRANT SELECT ON TABLE public.permissions TO "databasus-32844a54";
GRANT SELECT ON TABLE public.permissions TO "databasus-d9dbcfa9";


--
-- Name: TABLE placed_students; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.placed_students TO anon;
GRANT ALL ON TABLE public.placed_students TO authenticated;
GRANT ALL ON TABLE public.placed_students TO service_role;
GRANT SELECT ON TABLE public.placed_students TO "databasus-32844a54";
GRANT SELECT ON TABLE public.placed_students TO "databasus-d9dbcfa9";


--
-- Name: TABLE placement_cells; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.placement_cells TO anon;
GRANT ALL ON TABLE public.placement_cells TO authenticated;
GRANT ALL ON TABLE public.placement_cells TO service_role;
GRANT SELECT ON TABLE public.placement_cells TO "databasus-32844a54";
GRANT SELECT ON TABLE public.placement_cells TO "databasus-d9dbcfa9";


--
-- Name: TABLE posts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.posts TO anon;
GRANT ALL ON TABLE public.posts TO authenticated;
GRANT ALL ON TABLE public.posts TO service_role;
GRANT SELECT ON TABLE public.posts TO "databasus-32844a54";
GRANT SELECT ON TABLE public.posts TO "databasus-d9dbcfa9";


--
-- Name: TABLE recruiters; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.recruiters TO anon;
GRANT ALL ON TABLE public.recruiters TO authenticated;
GRANT ALL ON TABLE public.recruiters TO service_role;
GRANT SELECT ON TABLE public.recruiters TO "databasus-32844a54";
GRANT SELECT ON TABLE public.recruiters TO "databasus-d9dbcfa9";


--
-- Name: TABLE redirects; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.redirects TO anon;
GRANT ALL ON TABLE public.redirects TO authenticated;
GRANT ALL ON TABLE public.redirects TO service_role;
GRANT SELECT ON TABLE public.redirects TO "databasus-32844a54";
GRANT SELECT ON TABLE public.redirects TO "databasus-d9dbcfa9";


--
-- Name: TABLE role_permissions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.role_permissions TO anon;
GRANT ALL ON TABLE public.role_permissions TO authenticated;
GRANT ALL ON TABLE public.role_permissions TO service_role;
GRANT SELECT ON TABLE public.role_permissions TO "databasus-32844a54";
GRANT SELECT ON TABLE public.role_permissions TO "databasus-d9dbcfa9";


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;
GRANT SELECT ON TABLE public.roles TO "databasus-32844a54";
GRANT SELECT ON TABLE public.roles TO "databasus-d9dbcfa9";


--
-- Name: TABLE scholarships; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.scholarships TO anon;
GRANT ALL ON TABLE public.scholarships TO authenticated;
GRANT ALL ON TABLE public.scholarships TO service_role;
GRANT SELECT ON TABLE public.scholarships TO "databasus-32844a54";
GRANT SELECT ON TABLE public.scholarships TO "databasus-d9dbcfa9";


--
-- Name: TABLE seo_metadata; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.seo_metadata TO anon;
GRANT ALL ON TABLE public.seo_metadata TO authenticated;
GRANT ALL ON TABLE public.seo_metadata TO service_role;
GRANT SELECT ON TABLE public.seo_metadata TO "databasus-32844a54";
GRANT SELECT ON TABLE public.seo_metadata TO "databasus-d9dbcfa9";


--
-- Name: TABLE sports; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.sports TO anon;
GRANT ALL ON TABLE public.sports TO authenticated;
GRANT ALL ON TABLE public.sports TO service_role;
GRANT SELECT ON TABLE public.sports TO "databasus-32844a54";
GRANT SELECT ON TABLE public.sports TO "databasus-d9dbcfa9";


--
-- Name: TABLE sports_achievements; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.sports_achievements TO anon;
GRANT ALL ON TABLE public.sports_achievements TO authenticated;
GRANT ALL ON TABLE public.sports_achievements TO service_role;
GRANT SELECT ON TABLE public.sports_achievements TO "databasus-32844a54";
GRANT SELECT ON TABLE public.sports_achievements TO "databasus-d9dbcfa9";


--
-- Name: TABLE staff_achievements; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.staff_achievements TO anon;
GRANT ALL ON TABLE public.staff_achievements TO authenticated;
GRANT ALL ON TABLE public.staff_achievements TO service_role;
GRANT SELECT ON TABLE public.staff_achievements TO "databasus-32844a54";
GRANT SELECT ON TABLE public.staff_achievements TO "databasus-d9dbcfa9";


--
-- Name: TABLE staff_department_assignments; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.staff_department_assignments TO anon;
GRANT ALL ON TABLE public.staff_department_assignments TO authenticated;
GRANT ALL ON TABLE public.staff_department_assignments TO service_role;
GRANT SELECT ON TABLE public.staff_department_assignments TO "databasus-32844a54";
GRANT SELECT ON TABLE public.staff_department_assignments TO "databasus-d9dbcfa9";


--
-- Name: TABLE staff_profiles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.staff_profiles TO anon;
GRANT ALL ON TABLE public.staff_profiles TO authenticated;
GRANT ALL ON TABLE public.staff_profiles TO service_role;
GRANT SELECT ON TABLE public.staff_profiles TO "databasus-32844a54";
GRANT SELECT ON TABLE public.staff_profiles TO "databasus-d9dbcfa9";


--
-- Name: TABLE student_clubs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.student_clubs TO anon;
GRANT ALL ON TABLE public.student_clubs TO authenticated;
GRANT ALL ON TABLE public.student_clubs TO service_role;
GRANT SELECT ON TABLE public.student_clubs TO "databasus-32844a54";
GRANT SELECT ON TABLE public.student_clubs TO "databasus-d9dbcfa9";


--
-- Name: TABLE testimonials; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.testimonials TO anon;
GRANT ALL ON TABLE public.testimonials TO authenticated;
GRANT ALL ON TABLE public.testimonials TO service_role;
GRANT SELECT ON TABLE public.testimonials TO "databasus-32844a54";
GRANT SELECT ON TABLE public.testimonials TO "databasus-d9dbcfa9";


--
-- Name: TABLE trusts; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.trusts TO anon;
GRANT ALL ON TABLE public.trusts TO authenticated;
GRANT ALL ON TABLE public.trusts TO service_role;
GRANT SELECT ON TABLE public.trusts TO "databasus-32844a54";
GRANT SELECT ON TABLE public.trusts TO "databasus-d9dbcfa9";


--
-- Name: TABLE user_profiles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_profiles TO anon;
GRANT ALL ON TABLE public.user_profiles TO authenticated;
GRANT ALL ON TABLE public.user_profiles TO service_role;
GRANT SELECT ON TABLE public.user_profiles TO "databasus-32844a54";
GRANT SELECT ON TABLE public.user_profiles TO "databasus-d9dbcfa9";


--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;
GRANT SELECT ON TABLE public.user_roles TO "databasus-32844a54";
GRANT SELECT ON TABLE public.user_roles TO "databasus-d9dbcfa9";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON SEQUENCES TO "databasus-32844a54";
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON SEQUENCES TO "databasus-d9dbcfa9";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON TABLES TO "databasus-32844a54";
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON TABLES TO "databasus-d9dbcfa9";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict 0Aq6KEty9xeIyoEuDHYClYU3IgfOxdIjMAfcAztd05RwtiEummm3tisrfVEmLaD

