-- ============================================
-- Selfie Wall — Initial Schema
-- ============================================

-- Presets: reusable branding/config templates
create table public.presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id),
  upload_config jsonb not null default '{}'::jsonb,
  display_config jsonb not null default '{"grid_columns": 3, "swap_interval": 6, "transition": "fade"}'::jsonb,
  logo_url text,
  primary_color text default '#ffffff',
  font_family text default 'Inter',
  assets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Events: each event is a unique selfie-wall instance
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  preset_id uuid references public.presets(id) on delete set null,
  crew_token text unique not null default replace(gen_random_uuid()::text, '-', ''),
  upload_config jsonb not null default '{}'::jsonb,
  display_config jsonb not null default '{"grid_columns": 3, "swap_interval": 6, "transition": "fade"}'::jsonb,
  logo_url text,
  primary_color text default '#ffffff',
  moderation_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  starts_at timestamptz,
  ends_at timestamptz
);

-- Selfies: uploaded images
create table public.selfies (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_path text not null,
  image_url text not null,
  display_name text,
  message text,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  session_id text,
  file_size_bytes integer,
  created_at timestamptz not null default now()
);

-- Admin profiles: linked to auth.users
create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'super_admin' check (role in ('super_admin')),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_events_slug on public.events(slug);
create index idx_events_crew_token on public.events(crew_token);
create index idx_selfies_event_id on public.selfies(event_id);
create index idx_selfies_status on public.selfies(status);
create index idx_selfies_event_status on public.selfies(event_id, status);
create index idx_selfies_created_at on public.selfies(created_at desc);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_presets_updated
  before update on public.presets
  for each row execute function public.handle_updated_at();

create trigger on_events_updated
  before update on public.events
  for each row execute function public.handle_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

alter table public.presets enable row level security;
alter table public.events enable row level security;
alter table public.selfies enable row level security;
alter table public.admin_profiles enable row level security;

-- Presets: only authenticated admins can read/write
create policy "Admins can do everything with presets"
  on public.presets for all
  using (auth.uid() in (select id from public.admin_profiles))
  with check (auth.uid() in (select id from public.admin_profiles));

-- Events: public can read active events, admins can do everything
create policy "Anyone can read active events"
  on public.events for select
  using (is_active = true);

create policy "Admins can do everything with events"
  on public.events for all
  using (auth.uid() in (select id from public.admin_profiles))
  with check (auth.uid() in (select id from public.admin_profiles));

-- Selfies: public can read approved selfies, anyone can insert, admins can do everything
create policy "Anyone can read approved selfies"
  on public.selfies for select
  using (status = 'approved');

create policy "Anyone can insert selfies"
  on public.selfies for insert
  with check (true);

create policy "Admins can do everything with selfies"
  on public.selfies for all
  using (auth.uid() in (select id from public.admin_profiles))
  with check (auth.uid() in (select id from public.admin_profiles));

-- Admin profiles: only admins can read
create policy "Admins can read admin profiles"
  on public.admin_profiles for select
  using (auth.uid() in (select id from public.admin_profiles));

create policy "Admins can manage admin profiles"
  on public.admin_profiles for all
  using (auth.uid() in (select id from public.admin_profiles))
  with check (auth.uid() in (select id from public.admin_profiles));

-- ============================================
-- Storage
-- ============================================

insert into storage.buckets (id, name, public)
values ('selfies', 'selfies', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can upload selfies"
  on storage.objects for insert
  with check (bucket_id = 'selfies');

create policy "Anyone can read selfies"
  on storage.objects for select
  using (bucket_id = 'selfies');

create policy "Admins can delete selfies"
  on storage.objects for delete
  using (
    bucket_id = 'selfies'
    and auth.uid() in (select id from public.admin_profiles)
  );

-- ============================================
-- Realtime
-- ============================================

alter publication supabase_realtime add table public.selfies;
