-- Tabla de trabajos de email (para Edge Functions o procesos externos)
CREATE TABLE IF NOT EXISTS public.email_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  level text NOT NULL,
  type text NOT NULL DEFAULT 'benefits',
  status text NOT NULL DEFAULT 'queued',
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_status ON public.email_jobs(status);

-- Trigger: cuando una membresía cambia a 'active', encolar email de beneficios
CREATE OR REPLACE FUNCTION public.enqueue_benefits_email() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS DISTINCT FROM 'active') THEN
    INSERT INTO public.email_jobs(email, level, type, status, payload)
    SELECT p.email, NEW.level, 'benefits', 'queued', jsonb_build_object('user_id', NEW.user_id)
    FROM public.profiles p
    WHERE p.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memberships_enqueue_email ON public.memberships;
CREATE TRIGGER trg_memberships_enqueue_email
AFTER UPDATE OF status ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_benefits_email();
