-- Historial de pedidos. Solo los escribe el webhook de Stripe (con la secret
-- key, que saltea RLS); los usuarios únicamente leen los suyos.
-- user_id es null cuando se compró sin sesión iniciada.
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  stripe_session_id text not null unique,
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  amount_total numeric(10, 2) not null,
  currency text not null,
  customer_email text,
  created_at timestamptz not null default now()
);

create index orders_user_id_created_at_idx on orders (user_id, created_at desc);

-- Nombre y precio se copian al momento de la compra: si después el producto
-- cambia o se borra, el pedido sigue mostrando lo que se pagó.
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0)
);

create index order_items_order_id_idx on order_items (order_id);
create index order_items_product_id_idx on order_items (product_id);

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Users can read their own orders"
  on orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read items of their own orders"
  on order_items for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );

-- Graba pedido + ítems en una sola transacción y descuenta stock.
-- Idempotente por stripe_session_id: Stripe puede reenviar el mismo evento,
-- y en ese caso no se duplica nada. Devuelve el id del pedido.
create function record_order(
  p_stripe_session_id text,
  p_user_id uuid,
  p_amount_total numeric,
  p_currency text,
  p_customer_email text,
  p_items jsonb
) returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_order_id uuid;
begin
  insert into public.orders (stripe_session_id, user_id, amount_total, currency, customer_email)
  values (p_stripe_session_id, p_user_id, p_amount_total, p_currency, p_customer_email)
  on conflict (stripe_session_id) do nothing
  returning id into v_order_id;

  if v_order_id is null then
    select id into v_order_id from public.orders where stripe_session_id = p_stripe_session_id;
    return v_order_id;
  end if;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
  select
    v_order_id,
    (item ->> 'product_id')::uuid,
    item ->> 'product_name',
    (item ->> 'unit_price')::numeric,
    (item ->> 'quantity')::integer
  from jsonb_array_elements(p_items) as item;

  update public.products p
  set stock = greatest(p.stock - sold.quantity, 0)
  from (
    select (item ->> 'product_id')::uuid as product_id, sum((item ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) as item
    where item ->> 'product_id' is not null
    group by 1
  ) as sold
  where p.id = sold.product_id
    and not p.made_to_order;

  return v_order_id;
end;
$$;

-- Solo el server (service_role) puede registrar pedidos.
revoke execute on function record_order from public, anon, authenticated;
grant execute on function record_order to service_role;
