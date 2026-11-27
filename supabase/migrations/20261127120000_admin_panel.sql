-- Panel /admin: quién administra, permisos de escritura sobre el catálogo y
-- un bucket de Storage para las fotos.

-- Administradores. Solo se agregan desde el SQL Editor (no hay política de
-- insert/update), así que nadie puede darse permisos desde la app.
create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- Cada quien puede ver solo si él mismo es admin (no queda público quién lo es).
create policy "Admins can see themselves"
  on admins for select
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Catálogo: la lectura sigue pública; escribir solo los admins.
create policy "Admins can insert products"
  on products for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update products"
  on products for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete products"
  on products for delete to authenticated
  using ((select public.is_admin()));

create policy "Admins can insert ventures"
  on ventures for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update ventures"
  on ventures for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete ventures"
  on ventures for delete to authenticated
  using ((select public.is_admin()));

-- Fotos del catálogo: bucket público (cualquiera las ve por URL), máx. 8 MB,
-- solo imágenes; subir, reemplazar y borrar solo los admins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Admins can upload catalog images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'catalog' and (select public.is_admin()));

create policy "Admins can update catalog images"
  on storage.objects for update to authenticated
  using (bucket_id = 'catalog' and (select public.is_admin()));

create policy "Admins can delete catalog images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'catalog' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Para hacerte administrador, corre esta línea aparte con TU correo:
--   insert into admins (user_id) select id from auth.users where email = 'tu-correo@ejemplo.com';
-- ---------------------------------------------------------------------------
