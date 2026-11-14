create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  price numeric(10, 2) not null,
  currency text not null default 'ARS',
  image_url text,
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

create policy "Products are publicly readable"
  on products for select
  to anon, authenticated
  using (true);
