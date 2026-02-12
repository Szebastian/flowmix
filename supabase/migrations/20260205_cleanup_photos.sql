-- Script de Limpieza de URLs Caducadas
-- Ejecutar en el Editor SQL de Supabase

-- 1. Buscar y limpiar enlaces de ScraperAPI o Instagram CDN (que caducan)
UPDATE profiles
SET foto_url = NULL
WHERE foto_url LIKE '%scraperapi%' 
   OR foto_url LIKE '%instagram%';

-- 2. Confirmación (Opcional)
-- SELECT count(*) FROM profiles WHERE foto_url IS NULL;
