ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS transaction_ref text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS internal_notes text;
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
