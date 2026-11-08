-- Rosario Travels: shared store for bookings, inquiries, wheel leads,
-- Rosario AI conversations, newsletter subscribers and portal settings.
--
-- Every table has row-level security switched on and NO policies, so the
-- public (anon) and signed-in keys can read and write nothing. Only the
-- Next.js server, using the secret/service-role key, touches these tables
-- (app/api/store and app/api/admin/store).

create table public.bookings (
  id               text primary key,
  created_at       timestamptz not null default now(),
  journey_slug     text not null,
  name             text not null check (char_length(name) <= 200),
  email            text not null check (char_length(email) <= 320),
  phone            text check (char_length(phone) <= 60),
  travellers       int  not null check (travellers between 1 and 30),
  departure_month  text not null check (departure_month ~ '^\d{4}-\d{2}(-\d{2})?$'),
  notes            text check (char_length(notes) <= 4000),
  total            numeric(12,2) not null check (total >= 0),
  status           text not null default 'new' check (status in ('new','confirmed','deposit','cancelled')),
  source           text not null default 'website' check (source in ('website','rosario-ai','wheel')),
  promo            text
);
create index bookings_created_at_idx on public.bookings (created_at desc);

create table public.inquiries (
  id          text primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) <= 200),
  email       text not null check (char_length(email) <= 320),
  interest    text not null default '' check (char_length(interest) <= 200),
  message     text not null check (char_length(message) <= 8000),
  status      text not null default 'open' check (status in ('open','replied','closed'))
);
create index inquiries_created_at_idx on public.inquiries (created_at desc);

create table public.wheel_leads (
  id           text primary key,
  created_at   timestamptz not null default now(),
  email        text not null unique check (char_length(email) <= 320),
  prize_id     text not null,
  prize_label  text not null,
  code         text not null unique,
  redeemed     boolean not null default false
);

create table public.conversations (
  id          text primary key,
  started_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  mode        text not null default 'offline' check (mode in ('claude','offline')),
  messages    jsonb not null default '[]'::jsonb
);
create index conversations_started_at_idx on public.conversations (started_at desc);

create table public.subscribers (
  email       text primary key check (char_length(email) <= 320),
  created_at  timestamptz not null default now()
);

-- Portal-editable settings: 'settings', 'wheel_prizes', 'journey_overrides'.
create table public.site_config (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.bookings      enable row level security;
alter table public.inquiries     enable row level security;
alter table public.wheel_leads   enable row level security;
alter table public.conversations enable row level security;
alter table public.subscribers   enable row level security;
alter table public.site_config   enable row level security;

revoke all on public.bookings, public.inquiries, public.wheel_leads,
              public.conversations, public.subscribers, public.site_config
  from anon, authenticated;
