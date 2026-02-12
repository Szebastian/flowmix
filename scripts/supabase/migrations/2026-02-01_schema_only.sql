DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_level') THEN
  CREATE TYPE membership_level AS ENUM ('apoyo','interno','socio');
END IF;
END $$;

DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status') THEN
  CREATE TYPE membership_status AS ENUM ('active','pending','expired','cancelled');
END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  dj_name text NOT NULL,
  email text UNIQUE NOT NULL,
  nationality text,
  primary_software text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level membership_level NOT NULL,
  status membership_status NOT NULL DEFAULT 'pending',
  start_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS technical_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  os_family text,
  os_version text,
  architecture text,
  audio_formats text[] DEFAULT '{}'::text[],
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memberships ADD CONSTRAINT memberships_user_unique UNIQUE (user_id);
ALTER TABLE technical_data ADD CONSTRAINT technical_data_user_unique UNIQUE (user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_technical_user ON technical_data(user_id);

CREATE OR REPLACE VIEW dj_unified AS
SELECT
  p.id AS user_id,
  p.username,
  p.dj_name,
  p.email,
  p.nationality,
  p.primary_software,
  m.level,
  m.status,
  m.start_date,
  t.os_family,
  t.os_version,
  t.architecture,
  t.audio_formats
FROM profiles p
LEFT JOIN memberships m ON m.user_id = p.id
LEFT JOIN technical_data t ON t.user_id = p.id;
