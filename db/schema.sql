\restrict dbmate

-- Dumped from database version 18.6 (653b019)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-1.pgdg24.04+2)

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
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: availability_exceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_exceptions (
    exception_id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    exception_date date NOT NULL,
    is_available boolean NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT availability_exceptions_check CHECK ((((is_available = true) AND (start_time IS NOT NULL) AND (end_time IS NOT NULL)) OR ((is_available = false) AND (start_time IS NULL) AND (end_time IS NULL)))),
    CONSTRAINT availability_exceptions_check1 CHECK (((is_available = false) OR (end_time > start_time)))
);


--
-- Name: professional_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_profiles (
    profile_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    bio text,
    time_zone character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    service_id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    duration_minutes integer NOT NULL,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT services_duration_minutes_check CHECK ((duration_minutes > 0)),
    CONSTRAINT services_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    display_name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: weekly_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_availability (
    availability_id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    day_of_week smallint NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT weekly_availability_check CHECK ((end_time > start_time)),
    CONSTRAINT weekly_availability_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


--
-- Name: availability_exceptions availability_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_exceptions
    ADD CONSTRAINT availability_exceptions_pkey PRIMARY KEY (exception_id);


--
-- Name: availability_exceptions availability_exceptions_professional_id_exception_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_exceptions
    ADD CONSTRAINT availability_exceptions_professional_id_exception_date_key UNIQUE (professional_id, exception_date);


--
-- Name: weekly_availability no_overlapping_availability; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_availability
    ADD CONSTRAINT no_overlapping_availability EXCLUDE USING gist (professional_id WITH =, day_of_week WITH =, int4range((EXTRACT(epoch FROM start_time))::integer, (EXTRACT(epoch FROM end_time))::integer, '[)'::text) WITH &&);


--
-- Name: professional_profiles professional_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_pkey PRIMARY KEY (profile_id);


--
-- Name: professional_profiles professional_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_user_id_key UNIQUE (user_id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (service_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: weekly_availability weekly_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_availability
    ADD CONSTRAINT weekly_availability_pkey PRIMARY KEY (availability_id);


--
-- Name: availability_exceptions availability_exceptions_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_exceptions
    ADD CONSTRAINT availability_exceptions_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professional_profiles(profile_id);


--
-- Name: professional_profiles professional_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_profiles
    ADD CONSTRAINT professional_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: services services_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professional_profiles(profile_id);


--
-- Name: weekly_availability weekly_availability_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_availability
    ADD CONSTRAINT weekly_availability_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.professional_profiles(profile_id);


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('001'),
    ('20261020061847'),
    ('20261020071829'),
    ('20261020083136'),
    ('20261020094503');
