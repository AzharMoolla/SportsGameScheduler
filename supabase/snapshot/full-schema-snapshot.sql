-- ============================================================================

-- Silbo Sports — FULL SCHEMA SNAPSHOT (mothball preservation)

-- Generated from the live project gcnbgdpicgeahxscpsfc before pausing.

-- Restore: create a new Supabase project, then run this file in the SQL editor.

-- Structure only (no rows). auth.* is managed by Supabase and recreated for you.

-- ============================================================================

-- 1. EXTENSIONS

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists pg_stat_statements;
create extension if not exists pgcrypto;
create extension if not exists supabase_vault;
create extension if not exists "uuid-ossp";

-- 2. SCHEMAS

create schema if not exists private;

-- 3. TABLES

create table if not exists public.alert_preferences (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  remind_minutes_before integer not null default 60,
  notify_time_changes boolean not null default true,
  notify_cancellations boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  notify_new_events boolean not null default true,
  notify_participant_updates boolean not null default true,
  notify_venue_changes boolean not null default true,
  notify_broadcast_updates boolean not null default true
);

create table if not exists public.blog_posts (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  title text not null,
  dek text,
  body_markdown text not null default ''::text,
  hero_image_url text,
  sport_key text,
  related_event_id uuid,
  seo_description text,
  author text not null default 'Silbo Sports'::text,
  status text not null default 'draft'::text,
  published_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.bracket_slots (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  stage text not null,
  slot_key text not null,
  "position" integer not null default 0,
  source_event_id uuid,
  source_rule text,
  resolved_competitor_id uuid,
  label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.broadcasts (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  country text not null,
  channel text not null,
  stream_url text,
  kind text not null default 'tv'::text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.calendar_feeds (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  token text,
  name text not null,
  timezone text not null,
  filters jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  token_hash text,
  include_placeholders boolean not null default false,
  include_broadcasts boolean not null default false,
  last_accessed_at timestamp with time zone
);

create table if not exists public.competition_art_kits (
  id uuid not null default gen_random_uuid(),
  template_slug text not null,
  art_key text not null,
  surface_mode text not null,
  storage_path text,
  source_url text,
  license_status text not null default 'manual_review'::text,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  fallback_art_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.competition_calendar_rules (
  id uuid not null default gen_random_uuid(),
  template_slug text not null,
  month_number integer not null,
  window_label text not null,
  planning_note text not null,
  action_note text not null,
  priority integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.competition_instance_sources (
  id uuid not null default gen_random_uuid(),
  competition_instance_id uuid not null,
  source_target_id uuid,
  provider_target_id uuid,
  source_url text,
  source_type text not null default 'provider'::text,
  source_confidence text not null default 'provider'::text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.competition_instances (
  id uuid not null default gen_random_uuid(),
  template_slug text not null,
  sport_key text not null,
  official_name text not null,
  season_label text,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  schedule_release_expected_at timestamp with time zone,
  next_expected_at timestamp with time zone,
  result_hold_until timestamp with time zone,
  status text not null default 'announced'::text,
  global_importance integer not null default 50,
  region_importance jsonb not null default '{}'::jsonb,
  source_confidence text not null default 'manual'::text,
  href text not null,
  label text,
  detail text not null,
  art_key text,
  copy_variant text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.competition_templates (
  template_slug text not null,
  sport_key text not null,
  name text not null,
  card_template text not null,
  banner_template text not null,
  default_href text not null,
  default_art_key text,
  annual_window text,
  copy jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.competitor_aliases (
  id uuid not null default gen_random_uuid(),
  competitor_id uuid,
  provider_key text not null,
  provider_competitor_id text,
  alias text not null,
  normalized_alias text not null,
  source_confidence text not null default 'provider'::text,
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now()
);

create table if not exists public.competitors (
  id uuid not null default gen_random_uuid(),
  sport_id uuid not null,
  league_id uuid,
  kind text not null,
  name text not null,
  short_name text,
  country text,
  logo_url text,
  theme jsonb not null default '{}'::jsonb,
  provider_key text,
  provider_competitor_id text,
  parent_competitor_id uuid,
  players_synced_at timestamp with time zone
);

create table if not exists public.custom_league_members (
  id uuid not null default gen_random_uuid(),
  custom_league_id uuid not null,
  user_id uuid not null,
  role text not null
);

create table if not exists public.custom_leagues (
  id uuid not null default gen_random_uuid(),
  owner_user_id uuid not null,
  sport_id uuid,
  name text not null,
  timezone text not null,
  location text,
  public_token text not null,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  share_enabled boolean not null default true,
  include_notes_in_share boolean not null default false,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.custom_teams (
  id uuid not null default gen_random_uuid(),
  custom_league_id uuid not null,
  name text not null,
  color text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.event_bouts (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  segment_id uuid,
  weight_class text,
  red_corner_competitor_id uuid,
  blue_corner_competitor_id uuid,
  bout_order integer,
  scheduled_rounds integer,
  est_start_window tstzrange,
  status text not null default 'scheduled'::text,
  result jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.event_change_log (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  change_type text not null,
  significance text not null,
  old_value jsonb,
  new_value jsonb,
  source text not null default 'system'::text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.event_competitors (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  competitor_id uuid not null,
  role text not null,
  "position" integer
);

create table if not exists public.event_external_ids (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  source_target_id uuid,
  provider_key text not null,
  external_id text not null,
  raw_uid text,
  created_at timestamp with time zone not null default now(),
  source_confidence text not null default 'provider'::text,
  match_confidence integer not null default 100,
  payload_hash text,
  last_seen_at timestamp with time zone not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.event_segments (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  segment_key text not null,
  title text not null,
  "position" integer not null default 0,
  starts_at timestamp with time zone,
  status text not null default 'scheduled'::text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.event_sessions (
  id uuid not null default gen_random_uuid(),
  parent_event_id uuid not null,
  child_event_id uuid,
  session_key text not null,
  title text not null,
  session_type text not null,
  "position" integer not null default 0,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  status text not null default 'scheduled'::text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.event_status_history (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null,
  old_status text,
  new_status text,
  old_starts_at timestamp with time zone,
  new_starts_at timestamp with time zone,
  changed_at timestamp with time zone not null default now(),
  source text not null
);

create table if not exists public.events (
  id uuid not null default gen_random_uuid(),
  sport_id uuid not null,
  league_id uuid,
  season_id uuid,
  venue_id uuid,
  provider_key text,
  provider_event_id text,
  kind text not null,
  status text not null default 'scheduled'::text,
  title text not null,
  short_title text,
  starts_at timestamp with time zone,
  starts_at_tbd boolean not null default false,
  timezone text,
  home_competitor_id uuid,
  away_competitor_id uuid,
  visibility text not null default 'public'::text,
  custom_league_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  payload_hash text,
  last_checked_at timestamp with time zone,
  source_confidence text not null default 'provider'::text
);

create table if not exists public.leagues (
  id uuid not null default gen_random_uuid(),
  sport_id uuid not null,
  provider_key text,
  provider_league_id text,
  name text not null,
  short_name text,
  country text,
  logo_url text,
  theme jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  created_at timestamp with time zone not null default now(),
  display_rank integer not null default 500
);

create table if not exists public.notification_deliveries (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  event_id uuid,
  channel text not null,
  kind text not null,
  scheduled_for timestamp with time zone not null,
  sent_at timestamp with time zone,
  status text not null default 'pending'::text,
  error text,
  change_log_id uuid
);

create table if not exists public.profiles (
  user_id uuid not null,
  display_name text,
  default_timezone text,
  default_city text,
  locale text,
  hour12 boolean,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.provider_event_sources (
  id uuid not null default gen_random_uuid(),
  event_id uuid,
  provider_key text not null,
  external_id text not null,
  sport_key text not null,
  provider_league_id text,
  normalized_title text,
  starts_at timestamp with time zone,
  status text,
  source_confidence text not null default 'provider'::text,
  match_confidence integer not null default 100,
  payload_hash text,
  raw_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now()
);

create table if not exists public.provider_sync_runs (
  id uuid not null default gen_random_uuid(),
  provider_key text not null,
  sport_key text not null,
  league_id uuid,
  status text not null,
  fetched_count integer not null default 0,
  changed_count integer not null default 0,
  error text,
  started_at timestamp with time zone not null default now(),
  finished_at timestamp with time zone
);

create table if not exists public.provider_targets (
  id uuid not null default gen_random_uuid(),
  provider_key text not null default 'thesportsdb'::text,
  provider_league_id text not null,
  sport_key text not null,
  expected_name text not null,
  current_season text,
  priority integer not null default 100,
  is_active boolean not null default true,
  verified_at timestamp with time zone,
  teams_synced_at timestamp with time zone,
  events_synced_at timestamp with time zone,
  next_synced_at timestamp with time zone,
  last_status text,
  last_error text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.seasons (
  id uuid not null default gen_random_uuid(),
  league_id uuid not null,
  label text not null,
  starts_on date,
  ends_on date,
  provider_season_id text,
  is_current boolean not null default false
);

create table if not exists public.source_providers (
  id uuid not null default gen_random_uuid(),
  provider_key text not null,
  name text not null,
  source_type text not null,
  homepage_url text,
  terms_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.source_targets (
  id uuid not null default gen_random_uuid(),
  source_provider_id uuid not null,
  target_key text not null,
  source_type text not null,
  url text not null,
  sport_key text not null,
  league_id uuid,
  expected_name text not null,
  source_confidence text not null default 'provider'::text,
  is_active boolean not null default true,
  dry_run boolean not null default true,
  priority integer not null default 500,
  cadence_minutes integer not null default 1440,
  payload_hash text,
  last_checked_at timestamp with time zone,
  last_changed_at timestamp with time zone,
  events_synced_at timestamp with time zone,
  last_status text,
  last_error text,
  terms_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.sports (
  id uuid not null default gen_random_uuid(),
  key text not null,
  name text not null,
  default_theme jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.spotlight_events (
  id uuid not null default gen_random_uuid(),
  title text not null,
  sport_key text not null,
  label text not null,
  detail text not null,
  href text not null,
  event_id uuid,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  global_importance integer not null default 50,
  region_importance jsonb not null default '{}'::jsonb,
  lifecycle text not null default 'scheduled'::text,
  art_key text,
  source_confidence text not null default 'manual'::text,
  is_active boolean not null default true,
  editorial_note text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  competition_instance_id uuid,
  template_slug text,
  result_hold_until timestamp with time zone,
  schedule_release_expected_at timestamp with time zone
);

create table if not exists public.team_assets (
  id uuid not null default gen_random_uuid(),
  competitor_id uuid,
  league_id uuid,
  sport_key text,
  asset_type text not null,
  url text,
  storage_path text,
  source_url text,
  license_status text not null default 'manual_review'::text,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  dominant_colors jsonb not null default '{}'::jsonb,
  contrast_notes text,
  metadata jsonb not null default '{}'::jsonb,
  last_checked_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.user_follows (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  intent text not null default 'watch'::text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.venues (
  id uuid not null default gen_random_uuid(),
  name text not null,
  city text,
  region text,
  country text,
  timezone text,
  latitude double precision,
  longitude double precision
);

create table if not exists public.watch_links (
  id uuid not null default gen_random_uuid(),
  rule_key text not null,
  provider_key text not null,
  label text,
  event_id uuid,
  league_id uuid,
  country_codes text[] not null default '{}'::text[],
  sport_keys text[] not null default '{}'::text[],
  link_kind text not null default 'official'::text,
  url text,
  affiliate_url text,
  source_confidence text not null default 'manual'::text,
  priority integer not null default 100,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean not null default true,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.watch_providers (
  key text not null,
  name text not null,
  network text not null default 'direct'::text,
  affiliate_status text not null default 'none'::text,
  regions text[] not null default '{}'::text[],
  sports text[] not null default '{}'::text[],
  direct_url text not null,
  affiliate_url text,
  notes text,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 4. CONSTRAINTS (primary keys, uniques, checks, then foreign keys)

alter table public.alert_preferences add constraint alert_preferences_pkey PRIMARY KEY (id);
alter table public.alert_preferences add constraint alert_preferences_user_id_target_type_target_id_key UNIQUE (user_id, target_type, target_id);
alter table public.blog_posts add constraint blog_posts_pkey PRIMARY KEY (id);
alter table public.blog_posts add constraint blog_posts_slug_key UNIQUE (slug);
alter table public.blog_posts add constraint blog_posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text])));
alter table public.bracket_slots add constraint bracket_slots_event_id_slot_key_key UNIQUE (event_id, slot_key);
alter table public.bracket_slots add constraint bracket_slots_pkey PRIMARY KEY (id);
alter table public.broadcasts add constraint broadcasts_event_id_country_channel_key UNIQUE (event_id, country, channel);
alter table public.broadcasts add constraint broadcasts_kind_check CHECK ((kind = ANY (ARRAY['tv'::text, 'stream'::text, 'radio'::text])));
alter table public.broadcasts add constraint broadcasts_pkey PRIMARY KEY (id);
alter table public.calendar_feeds add constraint calendar_feeds_pkey PRIMARY KEY (id);
alter table public.calendar_feeds add constraint calendar_feeds_token_key UNIQUE (token);
alter table public.competition_art_kits add constraint competition_art_kits_license_status_check CHECK ((license_status = ANY (ARRAY['allowed'::text, 'provider_allowed'::text, 'manual_review'::text, 'blocked'::text])));
alter table public.competition_art_kits add constraint competition_art_kits_pkey PRIMARY KEY (id);
alter table public.competition_art_kits add constraint competition_art_kits_surface_mode_check CHECK ((surface_mode = ANY (ARRAY['broadcast'::text, 'program'::text, 'export'::text, 'email'::text])));
alter table public.competition_art_kits add constraint competition_art_kits_template_slug_art_key_surface_mode_key UNIQUE (template_slug, art_key, surface_mode);
alter table public.competition_calendar_rules add constraint competition_calendar_rules_month_number_check CHECK (((month_number >= 1) AND (month_number <= 12)));
alter table public.competition_calendar_rules add constraint competition_calendar_rules_pkey PRIMARY KEY (id);
alter table public.competition_calendar_rules add constraint competition_calendar_rules_template_slug_month_number_windo_key UNIQUE (template_slug, month_number, window_label);
alter table public.competition_instance_sources add constraint competition_instance_sources_check CHECK (((source_target_id IS NOT NULL) OR (provider_target_id IS NOT NULL) OR (source_url IS NOT NULL)));
alter table public.competition_instance_sources add constraint competition_instance_sources_pkey PRIMARY KEY (id);
alter table public.competition_instance_sources add constraint competition_instance_sources_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.competition_instances add constraint competition_instances_global_importance_check CHECK (((global_importance >= 0) AND (global_importance <= 100)));
alter table public.competition_instances add constraint competition_instances_pkey PRIMARY KEY (id);
alter table public.competition_instances add constraint competition_instances_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.competition_instances add constraint competition_instances_status_check CHECK ((status = ANY (ARRAY['announced'::text, 'schedule_pending'::text, 'schedule_live'::text, 'imminent'::text, 'active'::text, 'result_hold'::text, 'completed'::text, 'return_stub'::text, 'dormant'::text])));
alter table public.competition_instances add constraint competition_instances_template_slug_official_name_season_la_key UNIQUE (template_slug, official_name, season_label);
alter table public.competition_templates add constraint competition_templates_pkey PRIMARY KEY (template_slug);
alter table public.competitor_aliases add constraint competitor_aliases_pkey PRIMARY KEY (id);
alter table public.competitor_aliases add constraint competitor_aliases_provider_key_provider_competitor_id_norm_key UNIQUE (provider_key, provider_competitor_id, normalized_alias);
alter table public.competitor_aliases add constraint competitor_aliases_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.competitors add constraint competitors_kind_check CHECK ((kind = ANY (ARRAY['team'::text, 'person'::text, 'constructor'::text, 'custom_team'::text])));
alter table public.competitors add constraint competitors_pkey PRIMARY KEY (id);
alter table public.competitors add constraint competitors_provider_key_provider_competitor_id_key UNIQUE (provider_key, provider_competitor_id);
alter table public.custom_league_members add constraint custom_league_members_custom_league_id_user_id_key UNIQUE (custom_league_id, user_id);
alter table public.custom_league_members add constraint custom_league_members_pkey PRIMARY KEY (id);
alter table public.custom_league_members add constraint custom_league_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'viewer'::text])));
alter table public.custom_leagues add constraint custom_leagues_pkey PRIMARY KEY (id);
alter table public.custom_leagues add constraint custom_leagues_public_token_key UNIQUE (public_token);
alter table public.custom_teams add constraint custom_teams_pkey PRIMARY KEY (id);
alter table public.event_bouts add constraint event_bouts_pkey PRIMARY KEY (id);
alter table public.event_change_log add constraint event_change_log_pkey PRIMARY KEY (id);
alter table public.event_change_log add constraint event_change_log_significance_check CHECK ((significance = ANY (ARRAY['silent'::text, 'calendar'::text, 'notify'::text])));
alter table public.event_competitors add constraint event_competitors_event_id_competitor_id_key UNIQUE (event_id, competitor_id);
alter table public.event_competitors add constraint event_competitors_pkey PRIMARY KEY (id);
alter table public.event_competitors add constraint event_competitors_role_check CHECK ((role = ANY (ARRAY['home'::text, 'away'::text, 'driver'::text, 'player'::text, 'field'::text, 'participant'::text])));
alter table public.event_external_ids add constraint event_external_ids_match_confidence_check CHECK (((match_confidence >= 0) AND (match_confidence <= 100)));
alter table public.event_external_ids add constraint event_external_ids_pkey PRIMARY KEY (id);
alter table public.event_external_ids add constraint event_external_ids_provider_key_external_id_key UNIQUE (provider_key, external_id);
alter table public.event_external_ids add constraint event_external_ids_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.event_segments add constraint event_segments_event_id_segment_key_key UNIQUE (event_id, segment_key);
alter table public.event_segments add constraint event_segments_pkey PRIMARY KEY (id);
alter table public.event_sessions add constraint event_sessions_parent_event_id_session_key_key UNIQUE (parent_event_id, session_key);
alter table public.event_sessions add constraint event_sessions_pkey PRIMARY KEY (id);
alter table public.event_status_history add constraint event_status_history_pkey PRIMARY KEY (id);
alter table public.events add constraint events_pkey PRIMARY KEY (id);
alter table public.events add constraint events_provider_key_provider_event_id_key UNIQUE (provider_key, provider_event_id);
alter table public.events add constraint events_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.events add constraint events_visibility_check CHECK ((visibility = ANY (ARRAY['public'::text, 'private'::text])));
alter table public.leagues add constraint leagues_pkey PRIMARY KEY (id);
alter table public.leagues add constraint leagues_provider_key_provider_league_id_key UNIQUE (provider_key, provider_league_id);
alter table public.notification_deliveries add constraint notification_deliveries_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'push'::text])));
alter table public.notification_deliveries add constraint notification_deliveries_kind_check CHECK ((kind = ANY (ARRAY['reminder'::text, 'time_change'::text, 'time_set'::text, 'cancellation'::text, 'new_event'::text, 'participant_update'::text, 'venue_change'::text, 'broadcast_update'::text])));
alter table public.notification_deliveries add constraint notification_deliveries_pkey PRIMARY KEY (id);
alter table public.notification_deliveries add constraint notification_deliveries_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sending'::text, 'sent'::text, 'failed'::text, 'skipped'::text])));
alter table public.notification_deliveries add constraint notification_deliveries_user_id_event_id_channel_kind_key UNIQUE (user_id, event_id, channel, kind);
alter table public.profiles add constraint profiles_pkey PRIMARY KEY (user_id);
alter table public.provider_event_sources add constraint provider_event_sources_match_confidence_check CHECK (((match_confidence >= 0) AND (match_confidence <= 100)));
alter table public.provider_event_sources add constraint provider_event_sources_pkey PRIMARY KEY (id);
alter table public.provider_event_sources add constraint provider_event_sources_provider_key_external_id_key UNIQUE (provider_key, external_id);
alter table public.provider_event_sources add constraint provider_event_sources_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.provider_sync_runs add constraint provider_sync_runs_pkey PRIMARY KEY (id);
alter table public.provider_sync_runs add constraint provider_sync_runs_status_check CHECK ((status = ANY (ARRAY['running'::text, 'success'::text, 'failed'::text])));
alter table public.provider_targets add constraint provider_targets_pkey PRIMARY KEY (id);
alter table public.provider_targets add constraint provider_targets_provider_key_provider_league_id_key UNIQUE (provider_key, provider_league_id);
alter table public.push_subscriptions add constraint push_subscriptions_endpoint_key UNIQUE (endpoint);
alter table public.push_subscriptions add constraint push_subscriptions_pkey PRIMARY KEY (id);
alter table public.seasons add constraint seasons_pkey PRIMARY KEY (id);
alter table public.source_providers add constraint source_providers_pkey PRIMARY KEY (id);
alter table public.source_providers add constraint source_providers_provider_key_key UNIQUE (provider_key);
alter table public.source_providers add constraint source_providers_source_type_check CHECK ((source_type = ANY (ARRAY['api'::text, 'ics'::text, 'webcal'::text, 'curated'::text])));
alter table public.source_targets add constraint source_targets_cadence_minutes_check CHECK (((cadence_minutes >= 15) AND (cadence_minutes <= 43200)));
alter table public.source_targets add constraint source_targets_pkey PRIMARY KEY (id);
alter table public.source_targets add constraint source_targets_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.source_targets add constraint source_targets_source_type_check CHECK ((source_type = ANY (ARRAY['ics'::text, 'webcal'::text])));
alter table public.source_targets add constraint source_targets_target_key_key UNIQUE (target_key);
alter table public.sports add constraint sports_key_key UNIQUE (key);
alter table public.sports add constraint sports_pkey PRIMARY KEY (id);
alter table public.spotlight_events add constraint spotlight_events_global_importance_check CHECK (((global_importance >= 0) AND (global_importance <= 100)));
alter table public.spotlight_events add constraint spotlight_events_lifecycle_check CHECK ((lifecycle = ANY (ARRAY['draft'::text, 'scheduled'::text, 'live'::text, 'completed'::text, 'expired'::text, 'source_testing'::text, 'model_ready'::text, 'announced'::text, 'schedule_pending'::text, 'schedule_live'::text, 'imminent'::text, 'active'::text, 'result_hold'::text, 'return_stub'::text, 'dormant'::text])));
alter table public.spotlight_events add constraint spotlight_events_pkey PRIMARY KEY (id);
alter table public.spotlight_events add constraint spotlight_events_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'cached'::text, 'manual'::text, 'placeholder'::text])));
alter table public.spotlight_events add constraint spotlight_events_title_href_key UNIQUE (title, href);
alter table public.team_assets add constraint team_assets_asset_type_check CHECK ((asset_type = ANY (ARRAY['logo'::text, 'mascot'::text, 'headshot'::text, 'kit'::text, 'venue'::text, 'color_palette'::text, 'poster_art'::text, 'broadcast_mark'::text])));
alter table public.team_assets add constraint team_assets_check CHECK (((competitor_id IS NOT NULL) OR (league_id IS NOT NULL) OR (sport_key IS NOT NULL)));
alter table public.team_assets add constraint team_assets_license_status_check CHECK ((license_status = ANY (ARRAY['allowed'::text, 'provider_allowed'::text, 'manual_review'::text, 'blocked'::text])));
alter table public.team_assets add constraint team_assets_pkey PRIMARY KEY (id);
alter table public.user_follows add constraint user_follows_intent_check CHECK ((intent = ANY (ARRAY['watch'::text, 'attend'::text, 'track'::text])));
alter table public.user_follows add constraint user_follows_pkey PRIMARY KEY (id);
alter table public.user_follows add constraint user_follows_target_type_check CHECK ((target_type = ANY (ARRAY['sport'::text, 'league'::text, 'team'::text, 'competitor'::text, 'player'::text, 'custom_league'::text])));
alter table public.user_follows add constraint user_follows_user_id_target_type_target_id_intent_key UNIQUE (user_id, target_type, target_id, intent);
alter table public.venues add constraint venues_pkey PRIMARY KEY (id);
alter table public.watch_links add constraint watch_links_link_kind_check CHECK ((link_kind = ANY (ARRAY['official'::text, 'affiliate'::text, 'sponsored'::text, 'free'::text])));
alter table public.watch_links add constraint watch_links_pkey PRIMARY KEY (id);
alter table public.watch_links add constraint watch_links_rule_key_key UNIQUE (rule_key);
alter table public.watch_links add constraint watch_links_source_confidence_check CHECK ((source_confidence = ANY (ARRAY['official'::text, 'provider'::text, 'manual'::text, 'placeholder'::text])));
alter table public.watch_providers add constraint watch_providers_affiliate_status_check CHECK ((affiliate_status = ANY (ARRAY['none'::text, 'pending'::text, 'approved'::text, 'paused'::text, 'rejected'::text])));
alter table public.watch_providers add constraint watch_providers_network_check CHECK ((network = ANY (ARRAY['direct'::text, 'flexoffers'::text, 'impact'::text, 'cj'::text, 'awin'::text, 'partnerize'::text, 'cuelinks'::text, 'google'::text, 'other'::text])));
alter table public.watch_providers add constraint watch_providers_pkey PRIMARY KEY (key);
alter table public.alert_preferences add constraint alert_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.blog_posts add constraint blog_posts_related_event_id_fkey FOREIGN KEY (related_event_id) REFERENCES events(id) ON DELETE SET NULL;
alter table public.bracket_slots add constraint bracket_slots_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.bracket_slots add constraint bracket_slots_resolved_competitor_id_fkey FOREIGN KEY (resolved_competitor_id) REFERENCES competitors(id) ON DELETE SET NULL;
alter table public.bracket_slots add constraint bracket_slots_source_event_id_fkey FOREIGN KEY (source_event_id) REFERENCES events(id) ON DELETE SET NULL;
alter table public.broadcasts add constraint broadcasts_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.calendar_feeds add constraint calendar_feeds_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.competition_art_kits add constraint competition_art_kits_template_slug_fkey FOREIGN KEY (template_slug) REFERENCES competition_templates(template_slug) ON UPDATE CASCADE;
alter table public.competition_calendar_rules add constraint competition_calendar_rules_template_slug_fkey FOREIGN KEY (template_slug) REFERENCES competition_templates(template_slug) ON UPDATE CASCADE;
alter table public.competition_instance_sources add constraint competition_instance_sources_competition_instance_id_fkey FOREIGN KEY (competition_instance_id) REFERENCES competition_instances(id) ON DELETE CASCADE;
alter table public.competition_instance_sources add constraint competition_instance_sources_provider_target_id_fkey FOREIGN KEY (provider_target_id) REFERENCES provider_targets(id) ON DELETE SET NULL;
alter table public.competition_instance_sources add constraint competition_instance_sources_source_target_id_fkey FOREIGN KEY (source_target_id) REFERENCES source_targets(id) ON DELETE SET NULL;
alter table public.competition_instances add constraint competition_instances_sport_key_fkey FOREIGN KEY (sport_key) REFERENCES sports(key) ON UPDATE CASCADE;
alter table public.competition_instances add constraint competition_instances_template_slug_fkey FOREIGN KEY (template_slug) REFERENCES competition_templates(template_slug) ON UPDATE CASCADE;
alter table public.competition_templates add constraint competition_templates_sport_key_fkey FOREIGN KEY (sport_key) REFERENCES sports(key) ON UPDATE CASCADE;
alter table public.competitor_aliases add constraint competitor_aliases_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE;
alter table public.competitors add constraint competitors_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id);
alter table public.competitors add constraint competitors_parent_competitor_id_fkey FOREIGN KEY (parent_competitor_id) REFERENCES competitors(id) ON DELETE SET NULL;
alter table public.competitors add constraint competitors_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES sports(id);
alter table public.custom_league_members add constraint custom_league_members_custom_league_id_fkey FOREIGN KEY (custom_league_id) REFERENCES custom_leagues(id) ON DELETE CASCADE;
alter table public.custom_league_members add constraint custom_league_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.custom_leagues add constraint custom_leagues_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.custom_leagues add constraint custom_leagues_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES sports(id);
alter table public.custom_teams add constraint custom_teams_custom_league_id_fkey FOREIGN KEY (custom_league_id) REFERENCES custom_leagues(id) ON DELETE CASCADE;
alter table public.event_bouts add constraint event_bouts_blue_corner_competitor_id_fkey FOREIGN KEY (blue_corner_competitor_id) REFERENCES competitors(id) ON DELETE SET NULL;
alter table public.event_bouts add constraint event_bouts_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.event_bouts add constraint event_bouts_red_corner_competitor_id_fkey FOREIGN KEY (red_corner_competitor_id) REFERENCES competitors(id) ON DELETE SET NULL;
alter table public.event_bouts add constraint event_bouts_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES event_segments(id) ON DELETE SET NULL;
alter table public.event_change_log add constraint event_change_log_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.event_competitors add constraint event_competitors_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE;
alter table public.event_competitors add constraint event_competitors_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.event_external_ids add constraint event_external_ids_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.event_external_ids add constraint event_external_ids_source_target_id_fkey FOREIGN KEY (source_target_id) REFERENCES source_targets(id) ON DELETE SET NULL;
alter table public.event_segments add constraint event_segments_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.event_sessions add constraint event_sessions_child_event_id_fkey FOREIGN KEY (child_event_id) REFERENCES events(id) ON DELETE SET NULL;
alter table public.event_sessions add constraint event_sessions_parent_event_id_fkey FOREIGN KEY (parent_event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.event_status_history add constraint event_status_history_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.events add constraint events_away_competitor_id_fkey FOREIGN KEY (away_competitor_id) REFERENCES competitors(id);
alter table public.events add constraint events_custom_league_fk FOREIGN KEY (custom_league_id) REFERENCES custom_leagues(id) ON DELETE CASCADE;
alter table public.events add constraint events_home_competitor_id_fkey FOREIGN KEY (home_competitor_id) REFERENCES competitors(id);
alter table public.events add constraint events_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id);
alter table public.events add constraint events_season_id_fkey FOREIGN KEY (season_id) REFERENCES seasons(id);
alter table public.events add constraint events_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES sports(id);
alter table public.events add constraint events_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES venues(id);
alter table public.leagues add constraint leagues_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES sports(id);
alter table public.notification_deliveries add constraint notification_deliveries_change_log_id_fkey FOREIGN KEY (change_log_id) REFERENCES event_change_log(id) ON DELETE CASCADE;
alter table public.notification_deliveries add constraint notification_deliveries_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.notification_deliveries add constraint notification_deliveries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.profiles add constraint profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.provider_event_sources add constraint provider_event_sources_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
alter table public.provider_sync_runs add constraint provider_sync_runs_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id);
alter table public.provider_targets add constraint provider_targets_sport_key_fkey FOREIGN KEY (sport_key) REFERENCES sports(key);
alter table public.push_subscriptions add constraint push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.seasons add constraint seasons_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id);
alter table public.source_targets add constraint source_targets_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE SET NULL;
alter table public.source_targets add constraint source_targets_source_provider_id_fkey FOREIGN KEY (source_provider_id) REFERENCES source_providers(id) ON DELETE CASCADE;
alter table public.spotlight_events add constraint spotlight_events_competition_instance_id_fkey FOREIGN KEY (competition_instance_id) REFERENCES competition_instances(id) ON DELETE SET NULL;
alter table public.spotlight_events add constraint spotlight_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;
alter table public.spotlight_events add constraint spotlight_events_template_slug_fkey FOREIGN KEY (template_slug) REFERENCES competition_templates(template_slug) ON UPDATE CASCADE;
alter table public.team_assets add constraint team_assets_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE CASCADE;
alter table public.team_assets add constraint team_assets_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE;
alter table public.team_assets add constraint team_assets_sport_key_fkey FOREIGN KEY (sport_key) REFERENCES sports(key) ON UPDATE CASCADE;
alter table public.user_follows add constraint user_follows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.watch_links add constraint watch_links_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
alter table public.watch_links add constraint watch_links_league_id_fkey FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE;
alter table public.watch_links add constraint watch_links_provider_key_fkey FOREIGN KEY (provider_key) REFERENCES watch_providers(key) ON DELETE CASCADE;

-- 5. INDEXES

CREATE INDEX blog_posts_published_idx ON public.blog_posts USING btree (published_at DESC) WHERE (status = 'published'::text);
CREATE INDEX blog_posts_related_event_idx ON public.blog_posts USING btree (related_event_id) WHERE (related_event_id IS NOT NULL);
CREATE INDEX bracket_slots_event_position_idx ON public.bracket_slots USING btree (event_id, "position");
CREATE INDEX bracket_slots_resolved_competitor_idx ON public.bracket_slots USING btree (resolved_competitor_id) WHERE (resolved_competitor_id IS NOT NULL);
CREATE INDEX bracket_slots_source_event_idx ON public.bracket_slots USING btree (source_event_id) WHERE (source_event_id IS NOT NULL);
CREATE INDEX broadcasts_event_idx ON public.broadcasts USING btree (event_id);
CREATE UNIQUE INDEX calendar_feeds_token_hash_idx ON public.calendar_feeds USING btree (token_hash);
CREATE INDEX calendar_feeds_user_idx ON public.calendar_feeds USING btree (user_id);
CREATE INDEX competition_art_kits_template_idx ON public.competition_art_kits USING btree (template_slug, surface_mode);
CREATE INDEX competition_calendar_rules_month_idx ON public.competition_calendar_rules USING btree (month_number, priority);
CREATE INDEX competition_instance_sources_instance_idx ON public.competition_instance_sources USING btree (competition_instance_id);
CREATE INDEX competition_instance_sources_provider_target_idx ON public.competition_instance_sources USING btree (provider_target_id) WHERE (provider_target_id IS NOT NULL);
CREATE INDEX competition_instance_sources_source_target_idx ON public.competition_instance_sources USING btree (source_target_id) WHERE (source_target_id IS NOT NULL);
CREATE INDEX competition_instances_active_rank_idx ON public.competition_instances USING btree (is_active, global_importance DESC, starts_at);
CREATE INDEX competition_instances_sport_idx ON public.competition_instances USING btree (sport_key, status);
CREATE INDEX competition_instances_template_idx ON public.competition_instances USING btree (template_slug);
CREATE INDEX competition_templates_sport_key_idx ON public.competition_templates USING btree (sport_key);
CREATE INDEX competitor_aliases_competitor_idx ON public.competitor_aliases USING btree (competitor_id) WHERE (competitor_id IS NOT NULL);
CREATE INDEX competitor_aliases_lookup_idx ON public.competitor_aliases USING btree (provider_key, normalized_alias);
CREATE INDEX competitors_league_id_idx ON public.competitors USING btree (league_id) WHERE (league_id IS NOT NULL);
CREATE INDEX competitors_parent_idx ON public.competitors USING btree (parent_competitor_id);
CREATE INDEX competitors_sport_id_idx ON public.competitors USING btree (sport_id);
CREATE INDEX custom_league_members_user_id_idx ON public.custom_league_members USING btree (user_id);
CREATE INDEX custom_leagues_owner_user_id_idx ON public.custom_leagues USING btree (owner_user_id);
CREATE INDEX custom_leagues_sport_id_idx ON public.custom_leagues USING btree (sport_id) WHERE (sport_id IS NOT NULL);
CREATE INDEX custom_teams_custom_league_id_idx ON public.custom_teams USING btree (custom_league_id);
CREATE INDEX event_bouts_blue_corner_competitor_idx ON public.event_bouts USING btree (blue_corner_competitor_id) WHERE (blue_corner_competitor_id IS NOT NULL);
CREATE INDEX event_bouts_event_order_idx ON public.event_bouts USING btree (event_id, bout_order);
CREATE INDEX event_bouts_red_corner_competitor_idx ON public.event_bouts USING btree (red_corner_competitor_id) WHERE (red_corner_competitor_id IS NOT NULL);
CREATE INDEX event_bouts_segment_order_idx ON public.event_bouts USING btree (segment_id, bout_order);
CREATE INDEX event_change_log_event_idx ON public.event_change_log USING btree (event_id, created_at DESC);
CREATE INDEX event_change_log_significance_idx ON public.event_change_log USING btree (significance, created_at DESC);
CREATE INDEX event_competitors_competitor_idx ON public.event_competitors USING btree (competitor_id);
CREATE INDEX event_competitors_event_idx ON public.event_competitors USING btree (event_id);
CREATE INDEX event_external_ids_event_idx ON public.event_external_ids USING btree (event_id);
CREATE INDEX event_external_ids_last_seen_idx ON public.event_external_ids USING btree (provider_key, last_seen_at DESC);
CREATE INDEX event_external_ids_target_idx ON public.event_external_ids USING btree (source_target_id) WHERE (source_target_id IS NOT NULL);
CREATE INDEX event_segments_event_position_idx ON public.event_segments USING btree (event_id, "position");
CREATE INDEX event_sessions_child_event_idx ON public.event_sessions USING btree (child_event_id) WHERE (child_event_id IS NOT NULL);
CREATE INDEX event_sessions_parent_position_idx ON public.event_sessions USING btree (parent_event_id, "position");
CREATE INDEX event_sessions_starts_idx ON public.event_sessions USING btree (starts_at);
CREATE INDEX event_status_history_event_idx ON public.event_status_history USING btree (event_id, changed_at);
CREATE INDEX events_away_idx ON public.events USING btree (away_competitor_id, starts_at);
CREATE INDEX events_custom_league_idx ON public.events USING btree (custom_league_id, starts_at);
CREATE INDEX events_home_idx ON public.events USING btree (home_competitor_id, starts_at);
CREATE INDEX events_last_checked_idx ON public.events USING btree (last_checked_at);
CREATE INDEX events_league_starts_idx ON public.events USING btree (league_id, starts_at);
CREATE INDEX events_season_id_idx ON public.events USING btree (season_id) WHERE (season_id IS NOT NULL);
CREATE INDEX events_source_confidence_idx ON public.events USING btree (source_confidence);
CREATE INDEX events_sport_id_starts_at_idx ON public.events USING btree (sport_id, starts_at) WHERE (visibility = 'public'::text);
CREATE INDEX events_starts_at_idx ON public.events USING btree (starts_at);
CREATE INDEX events_venue_id_idx ON public.events USING btree (venue_id) WHERE (venue_id IS NOT NULL);
CREATE INDEX leagues_rank_idx ON public.leagues USING btree (sport_id, display_rank);
CREATE INDEX notification_deliveries_change_log_id_idx ON public.notification_deliveries USING btree (change_log_id) WHERE (change_log_id IS NOT NULL);
CREATE INDEX notification_deliveries_due_idx ON public.notification_deliveries USING btree (scheduled_for) WHERE (status = 'pending'::text);
CREATE INDEX notification_deliveries_event_id_idx ON public.notification_deliveries USING btree (event_id) WHERE (event_id IS NOT NULL);
CREATE INDEX provider_event_sources_event_idx ON public.provider_event_sources USING btree (event_id) WHERE (event_id IS NOT NULL);
CREATE INDEX provider_event_sources_provider_seen_idx ON public.provider_event_sources USING btree (provider_key, last_seen_at DESC);
CREATE INDEX provider_event_sources_sport_start_idx ON public.provider_event_sources USING btree (sport_key, starts_at DESC) WHERE (starts_at IS NOT NULL);
CREATE INDEX provider_sync_runs_league_id_idx ON public.provider_sync_runs USING btree (league_id) WHERE (league_id IS NOT NULL);
CREATE INDEX provider_targets_sport_key_idx ON public.provider_targets USING btree (sport_key);
CREATE INDEX push_subscriptions_user_id_idx ON public.push_subscriptions USING btree (user_id);
CREATE INDEX seasons_league_id_idx ON public.seasons USING btree (league_id);
CREATE INDEX source_targets_active_priority_idx ON public.source_targets USING btree (is_active, priority, last_checked_at);
CREATE INDEX source_targets_league_idx ON public.source_targets USING btree (league_id) WHERE (league_id IS NOT NULL);
CREATE INDEX source_targets_source_provider_id_idx ON public.source_targets USING btree (source_provider_id);
CREATE INDEX source_targets_sport_idx ON public.source_targets USING btree (sport_key);
CREATE INDEX spotlight_events_active_rank_idx ON public.spotlight_events USING btree (is_active, global_importance DESC, starts_at);
CREATE INDEX spotlight_events_competition_instance_idx ON public.spotlight_events USING btree (competition_instance_id);
CREATE INDEX spotlight_events_event_id_idx ON public.spotlight_events USING btree (event_id) WHERE (event_id IS NOT NULL);
CREATE INDEX spotlight_events_sport_idx ON public.spotlight_events USING btree (sport_key);
CREATE INDEX spotlight_events_template_slug_idx ON public.spotlight_events USING btree (template_slug) WHERE (template_slug IS NOT NULL);
CREATE INDEX team_assets_competitor_idx ON public.team_assets USING btree (competitor_id, asset_type);
CREATE INDEX team_assets_league_idx ON public.team_assets USING btree (league_id, asset_type);
CREATE INDEX team_assets_sport_idx ON public.team_assets USING btree (sport_key, asset_type);
CREATE INDEX user_follows_user_idx ON public.user_follows USING btree (user_id);
CREATE UNIQUE INDEX venues_name_key ON public.venues USING btree (name);
CREATE INDEX watch_links_active_priority_idx ON public.watch_links USING btree (is_active, priority);
CREATE INDEX watch_links_countries_gin_idx ON public.watch_links USING gin (country_codes);
CREATE INDEX watch_links_event_idx ON public.watch_links USING btree (event_id) WHERE (event_id IS NOT NULL);
CREATE INDEX watch_links_league_idx ON public.watch_links USING btree (league_id) WHERE (league_id IS NOT NULL);
CREATE INDEX watch_links_provider_key_idx ON public.watch_links USING btree (provider_key);
CREATE INDEX watch_links_sports_gin_idx ON public.watch_links USING gin (sport_keys);
CREATE INDEX watch_providers_active_priority_idx ON public.watch_providers USING btree (is_active, priority);
CREATE INDEX watch_providers_regions_gin_idx ON public.watch_providers USING gin (regions);
CREATE INDEX watch_providers_sports_gin_idx ON public.watch_providers USING gin (sports);

-- 6. PRIVATE HELPER FUNCTIONS (referenced by RLS policies)

CREATE OR REPLACE FUNCTION private.is_custom_league_admin(league_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select exists (
    select 1
    from public.custom_league_members m
    where m.custom_league_id = league_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$function$
;

CREATE OR REPLACE FUNCTION private.is_custom_league_member(league_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select exists (
    select 1
    from public.custom_league_members m
    where m.custom_league_id = league_id
      and m.user_id = auth.uid()
  );
$function$
;

-- 7. PUBLIC FUNCTIONS

CREATE OR REPLACE FUNCTION public.add_owner_membership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.custom_league_members (custom_league_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner')
  on conflict do nothing;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_overview()
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select jsonb_build_object(
    'generated_at', now(),
    'totals', jsonb_build_object(
      'events', (select count(*) from events),
      'upcoming_events', (select count(*) from events where starts_at >= now() and status <> 'finished'),
      'leagues', (select count(*) from leagues),
      'competitors', (select count(*) from competitors),
      'custom_leagues', (select count(*) from custom_leagues),
      'calendar_feeds', (select count(*) from calendar_feeds),
      'user_follows', (select count(*) from user_follows),
      'source_targets', (select count(*) from source_targets),
      'watch_links', (select count(*) from watch_links where is_active),
      'competition_instances', (select count(*) from competition_instances where is_active)
    ),
    'sports', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object(
          'sport', s.key,
          'leagues', count(distinct l.id),
          'events', count(distinct e.id),
          'upcoming', count(distinct e.id) filter (where e.starts_at >= now() and e.status <> 'finished')
        ) as x
        from sports s
        left join leagues l on l.sport_id = s.id
        left join events e on e.sport_id = s.id
        group by s.key
        order by count(distinct e.id) desc
      ) t
    ),
    'spotlight', (
      select jsonb_build_object(
        'competition_instances', (select count(*) from competition_instances where is_active),
        'static_cards', (select count(*) from spotlight_events where is_active),
        'top', coalesce((
          select jsonb_agg(r) from (
            select jsonb_build_object(
              'title', title,
              'sport_key', sport_key,
              'label', label,
              'lifecycle', lifecycle,
              'template_slug', template_slug,
              'ranking_score', ranking_score
            ) as r
            from spotlight_ranked(null, 8)
          ) spotlight_rows
        ), '[]'::jsonb)
      )
    ),
    'targets', (
      select jsonb_build_object(
        'active', count(*) filter (where is_active),
        'inactive', count(*) filter (where not is_active),
        'errored', count(*) filter (where last_status ilike '%fail%' or last_status = 'error' or last_status ilike '%error%'),
        'stale', count(*) filter (
          where is_active
            and coalesce(next_synced_at, events_synced_at, teams_synced_at, verified_at) < now() - interval '36 hours'
        )
      ) from provider_targets
    ),
    'provider_targets', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object(
          'provider_key', provider_key,
          'active', count(*) filter (where is_active),
          'errored', count(*) filter (where last_status ilike '%fail%' or last_status = 'error' or last_status ilike '%error%'),
          'stale', count(*) filter (
            where is_active
              and coalesce(next_synced_at, events_synced_at, teams_synced_at, verified_at) < now() - interval '36 hours'
          ),
          'last_checked_at', max(coalesce(next_synced_at, events_synced_at, teams_synced_at, verified_at)),
          'last_error', max(last_error) filter (where last_error is not null)
        ) as x
        from provider_targets
        group by provider_key
        order by provider_key
      ) t_provider
    ),
    'source_targets', (
      select jsonb_build_object(
        'total', count(*),
        'active', count(*) filter (where is_active),
        'dry_run', count(*) filter (where dry_run),
        'errored', count(*) filter (where last_status ilike '%fail%' or last_status = 'error' or last_error is not null),
        'recent', coalesce((
          select jsonb_agg(r) from (
            select jsonb_build_object(
              'target_key', target_key,
              'sport_key', sport_key,
              'dry_run', dry_run,
              'last_status', last_status,
              'last_checked_at', last_checked_at,
              'last_changed_at', last_changed_at,
              'last_error', last_error,
              'terms_note', terms_note
            ) as r
            from source_targets
            order by coalesce(last_checked_at, created_at) desc
            limit 8
          ) recent_rows
        ), '[]'::jsonb)
      )
      from source_targets
    ),
    'watch', (
      select jsonb_build_object(
        'providers', (select count(*) from watch_providers where is_active),
        'active_links', (select count(*) from watch_links where is_active),
        'pending_affiliates', (select count(*) from watch_providers where is_active and affiliate_status = 'pending'),
        'approved_affiliates', (select count(*) from watch_providers where is_active and affiliate_status = 'approved')
      )
    ),
    'recent_runs', (
      select coalesce(jsonb_agg(r), '[]'::jsonb) from (
        select jsonb_build_object(
          'provider_key', provider_key,
          'sport_key', sport_key,
          'status', status,
          'fetched', fetched_count,
          'changed', changed_count,
          'finished_at', finished_at,
          'error', error
        ) as r
        from provider_sync_runs
        order by coalesce(finished_at, started_at) desc
        limit 10
      ) t2
    )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.capture_event_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  -- An event is still alertable while it hasn't kicked off and isn't finished. Null starts_at
  -- means the fixture is TBD, which is upcoming by definition.
  alertable boolean := new.status <> 'finished'
    and (new.starts_at is null or new.starts_at > now());
begin
  begin
    -- Cancellation / postponement.
    if new.status is distinct from old.status and new.status in ('cancelled', 'postponed') then
      insert into public.event_change_log (event_id, change_type, significance, old_value, new_value, source)
      values (
        new.id,
        'cancellation',
        case when new.starts_at is null or new.starts_at > now() then 'notify' else 'calendar' end,
        to_jsonb(old.status),
        to_jsonb(new.status),
        'trigger'
      );
    end if;

    -- Kickoff time set or moved. Notify only when the NEW time is upcoming (a reschedule from a
    -- past slot to a future one is a legitimate alert) and the event isn't already finished.
    if new.starts_at is distinct from old.starts_at
       and new.starts_at is not null
       and new.starts_at > now() then
      insert into public.event_change_log (event_id, change_type, significance, old_value, new_value, source)
      values (
        new.id,
        case when old.starts_at is null then 'time_set' else 'time_change' end,
        case when new.status <> 'finished' then 'notify' else 'calendar' end,
        to_jsonb(old.starts_at),
        to_jsonb(new.starts_at),
        'trigger'
      );
    end if;

    -- Venue moved (both sides known — ignore initial venue assignment). Feed corrections on
    -- concluded games are recorded but must never notify.
    if new.venue_id is distinct from old.venue_id
       and new.venue_id is not null
       and old.venue_id is not null then
      insert into public.event_change_log (event_id, change_type, significance, old_value, new_value, source)
      values (
        new.id,
        'venue_change',
        case when alertable then 'notify' else 'calendar' end,
        to_jsonb(old.venue_id),
        to_jsonb(new.venue_id),
        'trigger'
      );
    end if;
  exception when others then
    -- Change capture is best-effort and must never abort the underlying event write.
    null;
  end;
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.claim_due_notifications(batch_size integer DEFAULT 100)
 RETURNS SETOF notification_deliveries
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Orphans first: the delivery's user was deleted (user_id ON DELETE SET NULL).
  update public.notification_deliveries
  set status = 'skipped', error = 'Recipient account deleted'
  where status = 'pending' and scheduled_for <= now() and user_id is null;

  -- Stale rows: nothing goes out for an event that started/finished, reminders keep a 15-minute
  -- post-kickoff grace for cron lag, and reminders for cancelled/postponed events never send
  -- (the cancellation alert is the one that should reach the user, not "starts soon").
  update public.notification_deliveries d
  set status = 'skipped',
      error = 'Stale at claim time: event started, finished, cancelled, or postponed'
  from public.events e
  where e.id = d.event_id
    and d.status = 'pending'
    and d.scheduled_for <= now()
    and (
      e.status = 'finished'
      or (d.kind <> 'reminder' and e.starts_at is not null and e.starts_at <= now())
      or (d.kind = 'reminder' and e.starts_at is not null and e.starts_at <= now() - interval '15 minutes')
      or (d.kind = 'reminder' and e.status in ('cancelled', 'postponed'))
    );

  return query
  update public.notification_deliveries d
  set status = 'sending'
  where d.id in (
    select id from public.notification_deliveries
    where status = 'pending' and scheduled_for <= now()
    order by scheduled_for
    limit batch_size
    for update skip locked
  )
  returning d.*;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_past_events(retention interval DEFAULT '90 days'::interval)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  deleted_count integer;
begin
  delete from public.events
  where starts_at is not null
    and starts_at < (now() - retention)
    -- A postponed event's starts_at is its OLD (past) slot; keep the row so the reschedule
    -- updates it in place (same id/UID) rather than resurfacing as a duplicate. Genuinely
    -- abandoned postponements age out after a year.
    and (status <> 'postponed' or starts_at < (now() - interval '365 days'));
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.competition_lifecycle_ranked(region text DEFAULT NULL::text, limit_count integer DEFAULT 16)
 RETURNS TABLE(competition_instance_id uuid, template_slug text, title text, sport_key text, label text, detail text, href text, lifecycle text, starts_at timestamp with time zone, ends_at timestamp with time zone, result_hold_until timestamp with time zone, schedule_release_expected_at timestamp with time zone, global_importance integer, ranking_score integer, art_key text, source_confidence text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with scored as (
    select
      ci.id as competition_instance_id,
      ci.template_slug,
      ci.official_name as title,
      ci.sport_key,
      coalesce(
        ci.label,
        case
          when ci.status = 'return_stub' then 'Returning soon'
          when ci.status = 'schedule_pending' then 'Schedule pending'
          when ci.status = 'schedule_live' then 'Schedule live'
          when ci.status = 'announced' then 'Dates announced'
          else initcap(replace(ci.status, '_', ' '))
        end
      ) as label,
      ci.detail,
      ci.href,
      case
        when ci.ends_at is not null
          and now() > ci.ends_at
          and now() <= coalesce(ci.result_hold_until, ci.ends_at + interval '24 hours')
          then 'result_hold'
        when ci.ends_at is not null
          and now() > coalesce(ci.result_hold_until, ci.ends_at + interval '24 hours')
          then 'completed'
        when ci.starts_at is not null
          and ci.starts_at <= now()
          and (ci.ends_at is null or ci.ends_at >= now())
          then 'active'
        when ci.starts_at is not null
          and ci.starts_at > now()
          and ci.starts_at <= now() + interval '72 hours'
          then 'imminent'
        else ci.status
      end as lifecycle,
      ci.starts_at,
      ci.ends_at,
      ci.result_hold_until,
      ci.schedule_release_expected_at,
      ci.global_importance,
      ci.art_key,
      ci.source_confidence,
      coalesce(nullif(ci.region_importance ->> upper(coalesce(region, '')), '')::integer, 0) as region_boost
    from public.competition_instances ci
    where ci.is_active
  )
  select
    scored.competition_instance_id,
    scored.template_slug,
    scored.title,
    scored.sport_key,
    scored.label,
    scored.detail,
    scored.href,
    scored.lifecycle,
    scored.starts_at,
    scored.ends_at,
    scored.result_hold_until,
    scored.schedule_release_expected_at,
    scored.global_importance,
    scored.global_importance
      + scored.region_boost
      + case scored.lifecycle
          when 'active' then 30
          when 'imminent' then 25
          when 'schedule_live' then 18
          when 'result_hold' then 12
          when 'schedule_pending' then 10
          when 'announced' then 6
          when 'return_stub' then 4
          when 'completed' then -40
          when 'dormant' then -60
          else 0
        end as ranking_score,
    scored.art_key,
    scored.source_confidence
  from scored
  where scored.lifecycle <> 'dormant'
    and scored.lifecycle <> 'completed'
  order by ranking_score desc, starts_at asc nulls last, title asc
  limit greatest(1, least(coalesce(limit_count, 16), 32));
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_schedule(start_at timestamp with time zone, end_at timestamp with time zone)
 RETURNS SETOF events
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
  select distinct e.*
  from public.events e
  join public.user_follows f
    on f.user_id = auth.uid()
   and (
     (f.target_type = 'sport' and f.target_id = e.sport_id)
     or (f.target_type = 'league' and f.target_id = e.league_id)
     or (f.target_type = 'custom_league' and f.target_id = e.custom_league_id)
     or (
       f.target_type in ('team', 'competitor', 'player')
       and exists (
         select 1 from public.event_competitors ec
         where ec.event_id = e.id and ec.competitor_id = f.target_id
       )
     )
   )
  where e.starts_at >= start_at
    and e.starts_at < end_at
  order by e.starts_at asc;
$function$
;

CREATE OR REPLACE FUNCTION public.get_shared_league(share_token text)
 RETURNS TABLE(id uuid, name text, timezone text, location text, sport_key text, include_notes_in_share boolean, payload jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    l.id,
    l.name,
    l.timezone,
    l.location,
    coalesce((select s.key from public.sports s where s.id = l.sport_id), (l.payload->>'sportKey'), 'custom') as sport_key,
    l.include_notes_in_share,
    l.payload
  from public.custom_leagues l
  where l.public_token = share_token
    and l.share_enabled = true;
$function$
;

CREATE OR REPLACE FUNCTION public.materialize_change_notifications(lookback interval DEFAULT '24:00:00'::interval)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  inserted_count integer;
begin
  with unified_changes as (
    select
      c.id as change_log_id,
      c.event_id,
      case
        when c.change_type in ('cancellation', 'postponement') then 'cancellation'
        when c.change_type = 'time_set' then 'time_set'
        when c.change_type in ('time_change', 'kickoff_change', 'start_time_change') then 'time_change'
        when c.change_type in ('participant_set', 'participant_update', 'bracket_slot_set', 'draw_set') then 'participant_update'
        when c.change_type in ('venue_set', 'venue_change') then 'venue_change'
        when c.change_type in ('broadcast_set', 'broadcast_update', 'watch_link_update') then 'broadcast_update'
        when c.change_type = 'new_event' then 'new_event'
        else 'time_change'
      end as kind
    from public.event_change_log c
    where c.significance = 'notify'
      and c.created_at >= now() - lookback

    union all

    select
      null::uuid as change_log_id,
      h.event_id,
      case
        when h.new_status in ('cancelled', 'postponed') then 'cancellation'
        when h.old_starts_at is null and h.new_starts_at is not null then 'time_set'
        else 'time_change'
      end as kind
    from public.event_status_history h
    join public.events e on e.id = h.event_id
    where h.changed_at >= now() - lookback
      and e.starts_at > now()
      and (
        h.new_status in ('cancelled', 'postponed')
        or h.old_starts_at is distinct from h.new_starts_at
      )
  ),
  interested as (
    select distinct
      f.user_id,
      c.event_id,
      c.change_log_id,
      c.kind,
      p.email_enabled,
      p.push_enabled
    from unified_changes c
    join public.events e on e.id = c.event_id
    join public.user_follows f
      on (
        (f.target_type = 'sport' and f.target_id = e.sport_id)
        or (f.target_type = 'league' and f.target_id = e.league_id)
        or (f.target_type = 'custom_league' and f.target_id = e.custom_league_id)
        or (
          f.target_type in ('team', 'competitor', 'player')
          and exists (
            select 1 from public.event_competitors ec
            where ec.event_id = e.id and ec.competitor_id = f.target_id
          )
        )
      )
    join public.alert_preferences p
      on p.user_id = f.user_id
     and p.target_type = f.target_type
     and p.target_id = f.target_id
    -- Never queue an alert for an event that has already started or finished. Null starts_at is
    -- an upcoming TBD fixture. A cancelled future event still notifies (starts_at > now()); a
    -- correction landing after kickoff does not, regardless of which source path produced it.
    where e.status <> 'finished'
      and (e.starts_at is null or e.starts_at > now())
      and (
        (c.kind = 'cancellation' and p.notify_cancellations)
        or (c.kind in ('time_change', 'time_set') and p.notify_time_changes)
        or (c.kind = 'new_event' and p.notify_new_events)
        or (c.kind = 'participant_update' and p.notify_participant_updates)
        or (c.kind = 'venue_change' and p.notify_venue_changes)
        or (c.kind = 'broadcast_update' and p.notify_broadcast_updates)
      )
  ),
  expanded as (
    select user_id, event_id, change_log_id, kind, 'email'::text as channel
    from interested where email_enabled
    union all
    select user_id, event_id, change_log_id, kind, 'push'
    from interested where push_enabled
  )
  insert into public.notification_deliveries
    (user_id, event_id, change_log_id, channel, kind, scheduled_for)
  select distinct on (user_id, event_id, channel, kind)
    user_id, event_id, change_log_id, channel, kind, now()
  from expanded
  order by user_id, event_id, channel, kind, change_log_id nulls last
  on conflict (user_id, event_id, channel, kind) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.materialize_reminders(horizon interval DEFAULT '48:00:00'::interval)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  inserted_count integer;
begin
  -- Resync first: pending reminders whose event time moved get their scheduled_for recomputed
  -- from the CURRENT starts_at. Only pending rows — sent history is immutable.
  with resynced as (
    select
      d.id,
      e.starts_at - make_interval(mins => min(ap.remind_minutes_before)) as new_scheduled_for
    from public.notification_deliveries d
    join public.events e on e.id = d.event_id
    join public.user_follows f on f.user_id = d.user_id
    join public.alert_preferences ap
      on ap.user_id = f.user_id
     and ap.target_type = f.target_type
     and ap.target_id = f.target_id
    where d.kind = 'reminder'
      and d.status = 'pending'
      and e.starts_at is not null
      and (
        (f.target_type = 'sport' and f.target_id = e.sport_id)
        or (f.target_type = 'league' and f.target_id = e.league_id)
        or (f.target_type = 'custom_league' and f.target_id = e.custom_league_id)
        or (
          f.target_type in ('team', 'competitor', 'player')
          and exists (
            select 1 from public.event_competitors ec
            where ec.event_id = e.id and ec.competitor_id = f.target_id
          )
        )
      )
    group by d.id, e.starts_at
  )
  update public.notification_deliveries d
  set scheduled_for = r.new_scheduled_for
  from resynced r
  where d.id = r.id
    and d.scheduled_for is distinct from r.new_scheduled_for;

  with due as (
    select
      f.user_id,
      e.id as event_id,
      p.remind_minutes_before,
      p.email_enabled,
      p.push_enabled,
      e.starts_at
    from public.user_follows f
    join public.alert_preferences p
      on p.user_id = f.user_id
     and p.target_type = f.target_type
     and p.target_id = f.target_id
    join public.events e
      on e.starts_at between now() and now() + horizon
     and e.status = 'scheduled'
     and (
       (f.target_type = 'sport' and f.target_id = e.sport_id)
       or (f.target_type = 'league' and f.target_id = e.league_id)
       or (f.target_type = 'custom_league' and f.target_id = e.custom_league_id)
       or (
         f.target_type in ('team', 'competitor', 'player')
         and exists (
           select 1 from public.event_competitors ec
           where ec.event_id = e.id and ec.competitor_id = f.target_id
         )
       )
     )
  ),
  expanded as (
    select user_id, event_id, 'email'::text as channel,
           starts_at - (remind_minutes_before || ' minutes')::interval as scheduled_for
    from due where email_enabled
    union all
    select user_id, event_id, 'push',
           starts_at - (remind_minutes_before || ' minutes')::interval
    from due where push_enabled
  )
  insert into public.notification_deliveries (user_id, event_id, channel, kind, scheduled_for)
  -- min(): a user can match the same event through several follows with different lead times;
  -- pick the earliest deterministically instead of whichever row the planner happened to keep.
  select user_id, event_id, channel, 'reminder', min(scheduled_for)
  from expanded
  where scheduled_for > now()
  group by user_id, event_id, channel
  on conflict (user_id, event_id, channel, kind) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.spotlight_ranked(region text DEFAULT NULL::text, limit_count integer DEFAULT 16)
 RETURNS TABLE(title text, sport_key text, label text, detail text, href text, global_importance integer, ranking_score integer, lifecycle text, template_slug text, art_key text, starts_at timestamp with time zone, ends_at timestamp with time zone, competition_instance_id uuid, source_confidence text, result_hold_until timestamp with time zone, schedule_release_expected_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with competition_cards as (
    select
      c.title,
      c.sport_key,
      c.label,
      c.detail,
      c.href,
      c.global_importance,
      c.ranking_score,
      c.lifecycle,
      c.template_slug,
      c.art_key,
      c.starts_at,
      c.ends_at,
      c.competition_instance_id,
      c.source_confidence,
      c.result_hold_until,
      c.schedule_release_expected_at
    from public.competition_lifecycle_ranked(region, 32) c
  ),
  static_cards as (
    select
      s.title,
      s.sport_key,
      s.label,
      s.detail,
      s.href,
      s.global_importance,
      s.global_importance
        + coalesce(nullif(s.region_importance ->> upper(coalesce(region, '')), '')::integer, 0) as ranking_score,
      s.lifecycle,
      s.template_slug,
      s.art_key,
      s.starts_at,
      s.ends_at,
      s.competition_instance_id,
      s.source_confidence,
      s.result_hold_until,
      s.schedule_release_expected_at
    from public.spotlight_events s
    where s.is_active
      and not exists (
        select 1
        from competition_cards c
        where c.title = s.title
          or (s.competition_instance_id is not null and s.competition_instance_id = c.competition_instance_id)
      )
  )
  select
    ranked.title,
    ranked.sport_key,
    ranked.label,
    ranked.detail,
    ranked.href,
    ranked.global_importance,
    ranked.ranking_score,
    ranked.lifecycle,
    ranked.template_slug,
    ranked.art_key,
    ranked.starts_at,
    ranked.ends_at,
    ranked.competition_instance_id,
    ranked.source_confidence,
    ranked.result_hold_until,
    ranked.schedule_release_expected_at
  from (
    select * from competition_cards
    union all
    select * from static_cards
  ) ranked
  order by
    ranked.ranking_score desc,
    ranked.starts_at asc nulls last,
    ranked.title asc
  limit greatest(1, least(coalesce(limit_count, 16), 32));
$function$
;

CREATE OR REPLACE FUNCTION public.touch_blog_posts_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

-- 8. TRIGGERS

CREATE TRIGGER blog_posts_touch_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION touch_blog_posts_updated_at();
CREATE TRIGGER custom_league_owner_membership AFTER INSERT ON public.custom_leagues FOR EACH ROW EXECUTE FUNCTION add_owner_membership();
CREATE TRIGGER events_capture_change AFTER UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION capture_event_change();

-- 9. ROW LEVEL SECURITY

alter table public.alert_preferences enable row level security;
alter table public.blog_posts enable row level security;
alter table public.bracket_slots enable row level security;
alter table public.broadcasts enable row level security;
alter table public.calendar_feeds enable row level security;
alter table public.competition_art_kits enable row level security;
alter table public.competition_calendar_rules enable row level security;
alter table public.competition_instance_sources enable row level security;
alter table public.competition_instances enable row level security;
alter table public.competition_templates enable row level security;
alter table public.competitor_aliases enable row level security;
alter table public.competitors enable row level security;
alter table public.custom_league_members enable row level security;
alter table public.custom_leagues enable row level security;
alter table public.custom_teams enable row level security;
alter table public.event_bouts enable row level security;
alter table public.event_change_log enable row level security;
alter table public.event_competitors enable row level security;
alter table public.event_external_ids enable row level security;
alter table public.event_segments enable row level security;
alter table public.event_sessions enable row level security;
alter table public.event_status_history enable row level security;
alter table public.events enable row level security;
alter table public.leagues enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.profiles enable row level security;
alter table public.provider_event_sources enable row level security;
alter table public.provider_sync_runs enable row level security;
alter table public.provider_targets enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.seasons enable row level security;
alter table public.source_providers enable row level security;
alter table public.source_targets enable row level security;
alter table public.sports enable row level security;
alter table public.spotlight_events enable row level security;
alter table public.team_assets enable row level security;
alter table public.user_follows enable row level security;
alter table public.venues enable row level security;
alter table public.watch_links enable row level security;
alter table public.watch_providers enable row level security;

-- 10. POLICIES

create policy "users manage their alert preferences" on public.alert_preferences as PERMISSIVE for ALL to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "blog_posts public read published" on public.blog_posts as PERMISSIVE for SELECT to public using ((status = 'published'::text));
create policy "bracket slots of public events are readable" on public.bracket_slots as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = bracket_slots.event_id) AND (e.visibility = 'public'::text)))));
create policy "broadcasts of public events are readable" on public.broadcasts as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = broadcasts.event_id) AND (e.visibility = 'public'::text)))));
create policy "users manage their calendar feeds" on public.calendar_feeds as PERMISSIVE for ALL to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "non-blocked competition art kits are readable" on public.competition_art_kits as PERMISSIVE for SELECT to anon, authenticated using ((license_status <> 'blocked'::text));
create policy "active competition calendar rules are readable" on public.competition_calendar_rules as PERMISSIVE for SELECT to anon, authenticated using ((is_active = true));
create policy "active competition instances are readable" on public.competition_instances as PERMISSIVE for SELECT to anon, authenticated using ((is_active = true));
create policy "active competition templates are readable" on public.competition_templates as PERMISSIVE for SELECT to anon, authenticated using ((is_active = true));
create policy "competitors are readable" on public.competitors as PERMISSIVE for SELECT to anon, authenticated using ((kind <> 'custom_team'::text));
create policy "members or owners read league members" on public.custom_league_members as PERMISSIVE for SELECT to authenticated using (private.is_custom_league_member(custom_league_id));
create policy "owners delete members" on public.custom_league_members as PERMISSIVE for DELETE to authenticated using (private.is_custom_league_admin(custom_league_id));
create policy "owners insert members" on public.custom_league_members as PERMISSIVE for INSERT to authenticated with check (private.is_custom_league_admin(custom_league_id));
create policy "owners update members" on public.custom_league_members as PERMISSIVE for UPDATE to authenticated using (private.is_custom_league_admin(custom_league_id)) with check (private.is_custom_league_admin(custom_league_id));
create policy "members or owners read custom leagues" on public.custom_leagues as PERMISSIVE for SELECT to authenticated using (((owner_user_id = ( SELECT auth.uid() AS uid)) OR private.is_custom_league_member(id)));
create policy "owners delete custom leagues" on public.custom_leagues as PERMISSIVE for DELETE to authenticated using ((( SELECT auth.uid() AS uid) = owner_user_id));
create policy "owners insert custom leagues" on public.custom_leagues as PERMISSIVE for INSERT to authenticated with check ((( SELECT auth.uid() AS uid) = owner_user_id));
create policy "owners update custom leagues" on public.custom_leagues as PERMISSIVE for UPDATE to authenticated using ((( SELECT auth.uid() AS uid) = owner_user_id)) with check ((( SELECT auth.uid() AS uid) = owner_user_id));
create policy "admins delete custom teams" on public.custom_teams as PERMISSIVE for DELETE to authenticated using (private.is_custom_league_admin(custom_league_id));
create policy "admins insert custom teams" on public.custom_teams as PERMISSIVE for INSERT to authenticated with check (private.is_custom_league_admin(custom_league_id));
create policy "admins update custom teams" on public.custom_teams as PERMISSIVE for UPDATE to authenticated using (private.is_custom_league_admin(custom_league_id)) with check (private.is_custom_league_admin(custom_league_id));
create policy "members read custom teams" on public.custom_teams as PERMISSIVE for SELECT to authenticated using (private.is_custom_league_member(custom_league_id));
create policy "bouts of public events are readable" on public.event_bouts as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = event_bouts.event_id) AND (e.visibility = 'public'::text)))));
create policy "public event change logs are readable" on public.event_change_log as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = event_change_log.event_id) AND (e.visibility = 'public'::text)))));
create policy "competitors of public events are readable" on public.event_competitors as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = event_competitors.event_id) AND (e.visibility = 'public'::text)))));
create policy "segments of public events are readable" on public.event_segments as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = event_segments.event_id) AND (e.visibility = 'public'::text)))));
create policy "sessions of public events are readable" on public.event_sessions as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = event_sessions.parent_event_id) AND (e.visibility = 'public'::text)))));
create policy "authenticated users read allowed events" on public.events as PERMISSIVE for SELECT to authenticated using (((visibility = 'public'::text) OR ((visibility = 'private'::text) AND (custom_league_id IS NOT NULL) AND private.is_custom_league_member(custom_league_id))));
create policy "custom league admins delete events" on public.events as PERMISSIVE for DELETE to authenticated using (((custom_league_id IS NOT NULL) AND private.is_custom_league_admin(custom_league_id)));
create policy "custom league admins insert events" on public.events as PERMISSIVE for INSERT to authenticated with check (((visibility = 'private'::text) AND (custom_league_id IS NOT NULL) AND private.is_custom_league_admin(custom_league_id)));
create policy "custom league admins update events" on public.events as PERMISSIVE for UPDATE to authenticated using (((custom_league_id IS NOT NULL) AND private.is_custom_league_admin(custom_league_id))) with check (((visibility = 'private'::text) AND (custom_league_id IS NOT NULL) AND private.is_custom_league_admin(custom_league_id)));
create policy "public events are readable to guests" on public.events as PERMISSIVE for SELECT to anon using ((visibility = 'public'::text));
create policy "public leagues are readable" on public.leagues as PERMISSIVE for SELECT to anon, authenticated using ((is_public = true));
create policy "users read their deliveries" on public.notification_deliveries as PERMISSIVE for SELECT to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy "users manage their profile" on public.profiles as PERMISSIVE for ALL to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "users manage their push subscriptions" on public.push_subscriptions as PERMISSIVE for ALL to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "seasons of public leagues are readable" on public.seasons as PERMISSIVE for SELECT to anon, authenticated using ((EXISTS ( SELECT 1
   FROM leagues l
  WHERE ((l.id = seasons.league_id) AND l.is_public))));
create policy "sports are readable" on public.sports as PERMISSIVE for SELECT to anon, authenticated using (true);
create policy "active spotlight events are readable" on public.spotlight_events as PERMISSIVE for SELECT to anon, authenticated using ((is_active = true));
create policy "non-blocked team assets are readable" on public.team_assets as PERMISSIVE for SELECT to anon, authenticated using ((license_status <> 'blocked'::text));
create policy "users manage their follows" on public.user_follows as PERMISSIVE for ALL to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));
create policy "venues are readable" on public.venues as PERMISSIVE for SELECT to anon, authenticated using (true);
create policy "active watch links are readable" on public.watch_links as PERMISSIVE for SELECT to anon, authenticated using ((is_active AND ((starts_at IS NULL) OR (starts_at <= now())) AND ((ends_at IS NULL) OR (ends_at >= now())) AND ((event_id IS NULL) OR (EXISTS ( SELECT 1
   FROM events e
  WHERE ((e.id = watch_links.event_id) AND (e.visibility = 'public'::text))))) AND ((league_id IS NULL) OR (EXISTS ( SELECT 1
   FROM leagues l
  WHERE ((l.id = watch_links.league_id) AND l.is_public))))));
create policy "active watch providers are readable" on public.watch_providers as PERMISSIVE for SELECT to anon, authenticated using (is_active);

-- 11. CRON JOBS (recreate manually if you resume; see supabase/cron.sql)

--   cleanup-past-events  =>  30 4 * * *
--   ics-feed-ingest  =>  17 */6 * * *
--   notifications-dispatch  =>  */5 * * * *
--   provider-hydrate-openf1  =>  42 7 * * *
--   provider-hydrate-pandascore  =>  21 * * * *
--   provider-hydrate-players  =>  7,27,47 * * * *
--   provider-hydrate-thesportsdb  =>  */15 * * * *
