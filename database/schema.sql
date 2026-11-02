-- ==============================================================
-- Testimonial Platform - PostgreSQL schema
-- Database name: TestimonialDB
-- NOTE: the NestJS backend creates these tables automatically
--       (DB_SYNC=true). Use this file only if you prefer manual setup.
-- ==============================================================


CREATE TYPE public.spaces_wall_layout_enum AS ENUM (
    'masonry',
    'grid'
);

CREATE TYPE public.spaces_wall_theme_enum AS ENUM (
    'light',
    'dark'
);

CREATE TYPE public.testimonials_source_enum AS ENUM (
    'collected',
    'imported'
);

CREATE TYPE public.testimonials_type_enum AS ENUM (
    'text',
    'video'
);

CREATE TABLE public.admins (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;

CREATE TABLE public.spaces (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(60) NOT NULL,
    logo character varying(255),
    header_title character varying(200) NOT NULL,
    custom_message text NOT NULL,
    questions jsonb DEFAULT '[]'::jsonb NOT NULL,
    collect_text boolean DEFAULT true NOT NULL,
    collect_video boolean DEFAULT true NOT NULL,
    collect_star_rating boolean DEFAULT true NOT NULL,
    collect_email boolean DEFAULT true NOT NULL,
    collect_company boolean DEFAULT true NOT NULL,
    collect_job_title boolean DEFAULT true NOT NULL,
    collect_photo boolean DEFAULT true NOT NULL,
    thank_you_title character varying(200) DEFAULT 'Thank you!'::character varying NOT NULL,
    thank_you_message text DEFAULT 'Thanks so much for your testimonial! It means a lot to us.'::text NOT NULL,
    button_color character varying(9) DEFAULT '#6366f1'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    wall_theme public.spaces_wall_theme_enum DEFAULT 'light'::public.spaces_wall_theme_enum NOT NULL,
    wall_layout public.spaces_wall_layout_enum DEFAULT 'masonry'::public.spaces_wall_layout_enum NOT NULL,
    wall_show_rating boolean DEFAULT true NOT NULL,
    wall_show_date boolean DEFAULT true NOT NULL,
    wall_show_branding boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    owner_id integer NOT NULL
);

CREATE SEQUENCE public.spaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.spaces_id_seq OWNED BY public.spaces.id;

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    type public.testimonials_type_enum DEFAULT 'text'::public.testimonials_type_enum NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150),
    job_title character varying(150),
    company character varying(150),
    photo character varying(255),
    video character varying(255),
    rating smallint,
    message text,
    consent boolean DEFAULT true NOT NULL,
    source public.testimonials_source_enum DEFAULT 'collected'::public.testimonials_source_enum NOT NULL,
    is_liked boolean DEFAULT false NOT NULL,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    space_id integer NOT NULL
);

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    company character varying(150),
    profile_image character varying(255),
    is_banned boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);

ALTER TABLE ONLY public.spaces ALTER COLUMN id SET DEFAULT nextval('public.spaces_id_seq'::regclass);

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT "PK_63b03c608bd258f115a0a4a1060" PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT "PK_dbe542974aca57afcb60709d4c8" PRIMARY KEY (id);

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY (id);

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT "UQ_cd9fb43bf0fb88748387fba51c7" UNIQUE (slug);

CREATE INDEX "IDX_266b4a34169ee3bf215693849f" ON public.testimonials USING btree (space_id, created_at);

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT "FK_a55ac21b990ab6b7544febfbd1b" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT "FK_c206bc92ea5c9b82ab1a6e5c879" FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;

