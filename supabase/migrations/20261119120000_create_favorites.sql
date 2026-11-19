-- Productos que cada usuario marcó con el corazón.
-- Es privado: cada uno solo ve y toca sus propios favoritos.
create table favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- La PK ya indexa por user_id; este índice cubre el cascade al borrar productos.
create index favorites_product_id_idx on favorites (product_id);

alter table favorites enable row level security;

create policy "Users can read their own favorites"
  on favorites for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own favorites"
  on favorites for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own favorites"
  on favorites for delete
  to authenticated
  using ((select auth.uid()) = user_id);
