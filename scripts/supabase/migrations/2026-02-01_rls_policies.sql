-- Habilitar RLS en tablas normalizadas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Lectura sólo para usuarios autenticados (JWT válido en Supabase)
CREATE POLICY select_profiles_authenticated
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY select_memberships_authenticated
  ON memberships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY select_technical_authenticated
  ON technical_data FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY select_feedbacks_authenticated
  ON feedbacks FOR SELECT
  TO authenticated
  USING (true);

-- Escritura sólo para service_role (clave secreta del backend)
CREATE POLICY write_profiles_service_role
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY write_memberships_service_role
  ON memberships FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY write_technical_service_role
  ON technical_data FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
CREATE POLICY write_feedbacks_service_role
  ON feedbacks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Vista unificada: conceder lectura a autenticados
GRANT SELECT ON dj_unified TO authenticated;
GRANT SELECT ON dj_feedbacks TO authenticated;

-- Opcional: permitir lectura pública si necesitas exponer datos no sensibles
-- GRANT SELECT ON dj_unified TO anon;

-- Nota:
-- - 'authenticated' corresponde a usuarios con sesión (JWT) de Supabase Auth.
-- - 'service_role' es la clave de servicio del proyecto; úsala sólo en backend.
