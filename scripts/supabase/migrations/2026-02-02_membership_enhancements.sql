-- Mejoras para el flujo de pago de membresías
-- Agrega columnas para meses pagados y fecha de vencimiento

-- 1. Agregar columna para meses pagados
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS months_paid integer DEFAULT 1;

-- 2. Agregar columna para fecha de vencimiento
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS expiry_date timestamptz;

-- 3. Agregar columna user_id a email_jobs si no existe (para compatibilidad)
ALTER TABLE public.email_jobs 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- 4. Crear índice en expiry_date para consultas de vencimientos
CREATE INDEX IF NOT EXISTS idx_memberships_expiry_date 
ON public.memberships(expiry_date);

-- 5. Comentarios para documentación
COMMENT ON COLUMN public.memberships.months_paid IS 'Cantidad de meses pagados por adelantado';
COMMENT ON COLUMN public.memberships.expiry_date IS 'Fecha de vencimiento calculada basada en start_date + months_paid';

-- 6. Función para calcular automáticamente expiry_date al insertar/actualizar
CREATE OR REPLACE FUNCTION public.calculate_membership_expiry() 
RETURNS trigger AS $$
BEGIN
  IF NEW.start_date IS NOT NULL AND NEW.months_paid IS NOT NULL THEN
    NEW.expiry_date := NEW.start_date + (NEW.months_paid || ' months')::interval;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para calcular expiry_date automáticamente
DROP TRIGGER IF EXISTS trg_calculate_expiry ON public.memberships;
CREATE TRIGGER trg_calculate_expiry
BEFORE INSERT OR UPDATE OF start_date, months_paid ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.calculate_membership_expiry();
