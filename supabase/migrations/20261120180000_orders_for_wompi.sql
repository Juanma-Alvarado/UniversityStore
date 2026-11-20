-- Cambio de Stripe a Wompi (Colombia, COP, PSE).
-- Wompi no informa qué productos se compraron, solo referencia + monto + estado.
-- Por eso el pedido se crea "pending" antes de pagar (su id es la referencia
-- de Wompi) y se confirma cuando Wompi avisa que la transacción terminó.

-- Precios en pesos colombianos.
alter table products alter column currency set default 'COP';
update products set currency = 'COP' where currency <> 'COP';

drop function if exists record_order(text, uuid, numeric, text, text, jsonb);

alter table orders rename column stripe_session_id to payment_id;
alter table orders alter column payment_id drop not null;
alter table orders alter column status set default 'pending';
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'paid', 'failed', 'refunded'));
alter table orders add column updated_at timestamptz not null default now();

-- Crea el pedido pendiente con precios leídos de la base (nunca del navegador).
-- p_items: [{ "product_id": uuid, "quantity": int }]. Devuelve id y total.
create function create_pending_order(
  p_user_id uuid,
  p_customer_email text,
  p_items jsonb
) returns table (order_id uuid, amount_total numeric, currency text)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_order_id uuid;
  v_cart jsonb;
  v_currency text;
  v_total numeric;
  v_requested int;
  v_found int;
  v_currencies int;
begin
  -- Agrupa por producto por si el mismo id viene repetido.
  select coalesce(jsonb_agg(jsonb_build_object('product_id', product_id, 'quantity', quantity)), '[]')
    into v_cart
  from (
    select (item ->> 'product_id')::uuid as product_id,
           sum((item ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) as item
    group by 1
  ) as grouped;

  if exists (
    select 1 from jsonb_to_recordset(v_cart) as c(product_id uuid, quantity int)
    where c.quantity <= 0
  ) then
    raise exception 'Cantidad inválida';
  end if;

  select jsonb_array_length(v_cart) into v_requested;
  select count(*), count(distinct p.currency), min(p.currency), sum(p.price * c.quantity)
    into v_found, v_currencies, v_currency, v_total
  from jsonb_to_recordset(v_cart) as c(product_id uuid, quantity int)
  join public.products p on p.id = c.product_id;

  if v_requested = 0 or v_found <> v_requested then
    raise exception 'Algún producto del carrito ya no existe';
  end if;
  if v_currencies <> 1 then
    raise exception 'El carrito mezcla monedas';
  end if;

  insert into public.orders (user_id, amount_total, currency, customer_email)
  values (p_user_id, v_total, v_currency, p_customer_email)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
  select v_order_id, p.id, p.name, p.price, c.quantity
  from jsonb_to_recordset(v_cart) as c(product_id uuid, quantity int)
  join public.products p on p.id = c.product_id;

  return query select v_order_id, v_total, v_currency;
end;
$$;

-- Aplica el resultado de una transacción de Wompi. Solo actúa sobre pedidos
-- pendientes, así que el webhook y la página de retorno pueden llamarla las
-- veces que sea sin duplicar efectos. Un APPROVED cuyo monto o moneda no
-- coincide con el pedido se marca como fallido en vez de pagado.
create function apply_payment_result(
  p_order_id uuid,
  p_payment_id text,
  p_status text,
  p_amount_in_cents bigint,
  p_currency text
) returns text
language plpgsql
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_new_status text;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pedido % no encontrado', p_order_id;
  end if;

  if v_order.status <> 'pending' then
    return v_order.status;
  end if;

  if p_status = 'APPROVED' then
    if round(v_order.amount_total * 100) = p_amount_in_cents and v_order.currency = p_currency then
      v_new_status := 'paid';
    else
      v_new_status := 'failed';
    end if;
  elsif p_status in ('DECLINED', 'VOIDED', 'ERROR') then
    v_new_status := 'failed';
  else
    return v_order.status; -- PENDING: todavía no hay resultado final
  end if;

  update public.orders
  set status = v_new_status, payment_id = p_payment_id, updated_at = now()
  where id = p_order_id;

  if v_new_status = 'paid' then
    update public.products p
    set stock = greatest(p.stock - oi.quantity, 0)
    from (
      select product_id, sum(quantity) as quantity
      from public.order_items
      where order_id = p_order_id and product_id is not null
      group by 1
    ) as oi
    where p.id = oi.product_id
      and not p.made_to_order;
  end if;

  return v_new_status;
end;
$$;

-- Solo el server (service_role) puede crear y confirmar pedidos.
revoke execute on function create_pending_order from public, anon, authenticated;
revoke execute on function apply_payment_result from public, anon, authenticated;
grant execute on function create_pending_order to service_role;
grant execute on function apply_payment_result to service_role;
