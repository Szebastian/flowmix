-- DEV ONLY: Permitir escritura desde anon para pruebas locales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Lectura para anon (si necesitas probar sin Auth)
CREATE POLICY select_profiles_anon
  ON profiles FOR SELECT
  TO anon
  USING (true);
CREATE POLICY select_memberships_anon
  ON memberships FOR SELECT
  TO anon
  USING (true);
CREATE POLICY select_technical_anon
  ON technical_data FOR SELECT
  TO anon
  USING (true);
CREATE POLICY select_feedbacks_anon
  ON feedbacks FOR SELECT
  TO anon
  USING (true);

-- Inserción/actualización para anon (sólo para DEV)
CREATE POLICY write_profiles_anon
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (true);
CREATE POLICY update_profiles_anon
  ON profiles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY write_memberships_anon
  ON memberships FOR INSERT
  TO anon
  WITH CHECK (true);
CREATE POLICY update_memberships_anon
  ON memberships FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY write_technical_anon
  ON technical_data FOR INSERT
  TO anon
  WITH CHECK (true);
CREATE POLICY write_feedbacks_anon
  ON feedbacks FOR INSERT
  TO anon
  WITH CHECK (true);
CREATE POLICY update_technical_anon
  ON technical_data FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
CREATE POLICY update_feedbacks_anon
  ON feedbacks FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Vista unificada
GRANT SELECT ON dj_unified TO anon;
GRANT SELECT ON dj_feedbacks TO anon;
