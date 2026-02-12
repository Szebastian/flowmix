-- Crear tabla pública 'waitlist' y políticas RLS para inserción/lectura/actualización con clave anónima
-- Ejecutar en el Editor SQL de Supabase

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  dj_name text,
  user_name text,
  country text,
  genre text,
  referral text,
  consent_marketing boolean,
  gender text,
  nationality text,
  instagram text,
  interests text[],
  audio_formats text[],
  os text,
  os_version text,
  architecture text,
  current_software text,
  position integer,
  total_entries integer,
  status text,
  joined_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Permitir SELECT público (lectura)
drop policy if exists "public_select_waitlist" on public.waitlist;
create policy "public_select_waitlist"
on public.waitlist
for select
to public
using (true);

-- Permitir INSERT público (registro en lista de espera)
drop policy if exists "public_insert_waitlist" on public.waitlist;
create policy "public_insert_waitlist"
on public.waitlist
for insert
to public
with check (true);

-- Permitir UPDATE público (para upsert por email)
drop policy if exists "public_update_waitlist" on public.waitlist;
create policy "public_update_waitlist"
on public.waitlist
for update
to public
using (true)
with check (true);

-- Verificación rápida (opcional)
-- select * from public.waitlist limit 1;
