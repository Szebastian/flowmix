-- Crear columna foto_url en profiles para almacenar la URL pública del avatar
-- Ejecutar en el Editor SQL de Supabase

alter table if exists public.profiles
  add column if not exists foto_url text;

-- Opcional: índice para consultas por email (ya debe existir como unique)
-- create unique index if not exists profiles_email_key on public.profiles(email);

-- Verificación rápida
-- select email, foto_url from public.profiles limit 5;
