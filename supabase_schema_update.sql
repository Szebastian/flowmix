-- Actualización de la tabla 'waitlist' para el formulario progresivo de 3 pasos
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Agregar columnas para Identidad (Paso 1)
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS "userName" text,
ADD COLUMN IF NOT EXISTS "djName" text; -- Ya existía, pero por si acaso

-- 2. Agregar columnas para Entorno Técnico (Paso 2)
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS "os" text,
ADD COLUMN IF NOT EXISTS "osVersion" text,
ADD COLUMN IF NOT EXISTS "architecture" text;

-- 3. Agregar columnas para Perfil Profesional y Geográfico (Paso 3)
ALTER TABLE public.waitlist 
ADD COLUMN IF NOT EXISTS "currentSoftware" text,
ADD COLUMN IF NOT EXISTS "nationality" text;

-- 4. Comentarios para documentación (Opcional)
COMMENT ON COLUMN public.waitlist."userName" IS 'Nombre de usuario para futuro login';
COMMENT ON COLUMN public.waitlist."djName" IS 'Nombre artístico del DJ';
COMMENT ON COLUMN public.waitlist."os" IS 'Sistema Operativo (Windows, macOS, Linux)';
COMMENT ON COLUMN public.waitlist."osVersion" IS 'Versión específica del OS (ej. Windows 11, Sonoma)';
COMMENT ON COLUMN public.waitlist."architecture" IS 'Arquitectura del CPU (x64, ARM64, Apple Silicon)';
COMMENT ON COLUMN public.waitlist."currentSoftware" IS 'Software DJ actual (Rekordbox, Serato, etc.)';
COMMENT ON COLUMN public.waitlist."nationality" IS 'Nacionalidad del usuario';
