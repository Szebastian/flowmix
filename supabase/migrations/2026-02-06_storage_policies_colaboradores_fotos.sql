-- Crear bucket público y políticas de acceso para avatares
-- Ejecutar en el Editor SQL de Supabase

-- 1) Crear bucket si no existe
insert into storage.buckets (id, name, public)
values ('colaboradores_fotos', 'colaboradores_fotos', true)
on conflict (id) do nothing;

-- 2) Políticas: lectura pública e inserción (para subir desde el cliente)
-- Nota: Ajusta según tus necesidades de seguridad; aquí se permite subir sólo dentro del bucket indicado.

drop policy if exists "Public can read colaboradores_fotos" on storage.objects;
create policy "Public can read colaboradores_fotos"
on storage.objects for select
using (bucket_id = 'colaboradores_fotos');

drop policy if exists "Public can insert colaboradores_fotos" on storage.objects;
create policy "Public can insert colaboradores_fotos"
on storage.objects for insert
with check (bucket_id = 'colaboradores_fotos');

-- 3) Opcional: permitir actualización/eliminación si necesitas sobrescribir/limpiar archivos
-- drop policy if exists "Public can update colaboradores_fotos" on storage.objects;
-- create policy "Public can update colaboradores_fotos"
-- on storage.objects for update
-- using (bucket_id = 'colaboradores_fotos')
-- with check (bucket_id = 'colaboradores_fotos');

-- drop policy if exists "Public can delete colaboradores_fotos" on storage.objects;
-- create policy "Public can delete colaboradores_fotos"
-- on storage.objects for delete
-- using (bucket_id = 'colaboradores_fotos');
