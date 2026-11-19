-- Reseñas de productos: una por usuario y producto (se edita, no se duplica).
-- user_id apunta a profiles para poder traer el nombre visible en la misma consulta.
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index reviews_user_id_idx on reviews (user_id);

alter table reviews enable row level security;

create policy "Reviews are publicly readable"
  on reviews for select
  to anon, authenticated
  using (true);

create policy "Users can write their own review"
  on reviews for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can edit their own review"
  on reviews for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own review"
  on reviews for delete
  to authenticated
  using ((select auth.uid()) = user_id);
