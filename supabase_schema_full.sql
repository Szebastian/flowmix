-- Script COMPLETO de creación de tabla 'waitlist' (RESET TOTAL)
-- ⚠️ ADVERTENCIA: Ejecutar este script BORRARÁ la tabla existente y sus datos.

-- 1. Eliminar tabla anterior si existe
DROP TABLE IF EXISTS public.waitlist;

-- 2. Crear tabla con la estructura nueva completa
CREATE TABLE public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  email text UNIQUE NOT NULL,
  
  -- Identidad (Paso 1)
  "userName" text,
  "djName" text,
  
  -- Entorno Técnico (Paso 2)
  "os" text,
  "osVersion" text,
  "architecture" text,
  
  -- Perfil Profesional y Geográfico (Paso 3)
  "currentSoftware" text,
  "nationality" text,
  "country" text, -- Mantenido por compatibilidad
  "gender" text,
  "referral" text,
  "consentMarketing" boolean DEFAULT false,
  
  -- Otros campos (Legacy/Opcionales)
  "genre" text,
  "position" numeric,
  "joinedAt" timestamptz
);

-- Habilitar Row Level Security (Seguridad)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserciones públicas (anon key)
CREATE POLICY "Enable insert for everyone" 
ON public.waitlist 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Crear política para permitir lecturas públicas (opcional, para contar filas)
CREATE POLICY "Enable select for everyone" 
ON public.waitlist 
FOR SELECT 
TO anon 
USING (true);

-- Crear política para permitir actualizaciones (upsert) basadas en email
CREATE POLICY "Enable update for everyone" 
ON public.waitlist 
FOR UPDATE
TO anon 
USING (true)
WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.waitlist IS 'Tabla principal de registro para la lista de espera de Flowmix';
