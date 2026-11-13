-- Hoteles Rosario: room reservations made on the website, on WhatsApp or by
-- the team in the portal. Same rules as the other tables: row-level security
-- on, no policies, only the Next.js server (secret key) reads and writes.
-- Rates, inventory and "closed to bookings" live in site_config under
-- the key 'hotel_overrides'.

create table public.stay_bookings (
  id          text primary key check (id ~ '^RS-[A-Z0-9-]{3,40}$'),
  created_at  timestamptz not null default now(),
  hotel       text not null,
  room        text not null,
  rooms       int  not null check (rooms between 1 and 10),
  guests      int  not null check (guests between 1 and 60),
  check_in    date not null,
  check_out   date not null,
  name        text not null check (char_length(name) <= 200),
  email       text not null check (char_length(email) <= 320),
  phone       text check (char_length(phone) <= 60),
  notes       text check (char_length(notes) <= 4000),
  extras      jsonb not null default '[]'::jsonb,
  total       numeric(12,2) not null check (total >= 0),
  status      text not null default 'new'
              check (status in ('new','confirmed','checked-in','checked-out','cancelled','no-show')),
  source      text not null default 'website'
              check (source in ('website','whatsapp','phone','walk-in','journey')),
  check (check_out > check_in)
);
create index stay_bookings_dates_idx on public.stay_bookings (hotel, check_in, check_out);
create index stay_bookings_created_at_idx on public.stay_bookings (created_at desc);

alter table public.stay_bookings enable row level security;
revoke all on public.stay_bookings from anon, authenticated;
