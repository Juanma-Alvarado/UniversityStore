-- Perfil público de cada cuenta (nombre visible en reviews, etc.).
-- auth.users no es accesible desde el cliente, por eso se espeja acá.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are publicly readable"
  on profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Crea el perfil automáticamente al registrarse, usando el nombre
-- que se manda en options.data.display_name del signUp.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
