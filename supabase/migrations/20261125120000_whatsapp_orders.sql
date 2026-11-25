-- Pedidos por WhatsApp mientras los pagos en línea (Wompi) están en pausa.
-- El pedido se registra con precios de la base y queda "requested": el
-- comprador lo envía por WhatsApp a cada emprendimiento y el pago y la entrega
-- se coordinan por fuera de la tienda.

alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'requested', 'paid', 'failed', 'refunded'));

-- Por dónde entró el pedido.
alter table orders add column channel text not null default 'wompi'
  check (channel in ('wompi', 'whatsapp'));

-- Reutiliza las validaciones de create_pending_order (productos que existen,
-- cantidades válidas, una sola moneda, precios de la base) y marca el pedido
-- como enviado por WhatsApp, todo en la misma transacción.
create function create_whatsapp_order(
  p_user_id uuid,
  p_customer_email text,
  p_items jsonb
) returns table (order_id uuid, amount_total numeric, currency text)
language plpgsql
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_order record;
begin
  select * into v_order
  from public.create_pending_order(p_user_id, p_customer_email, p_items);

  update public.orders
    set status = 'requested', channel = 'whatsapp', updated_at = now()
    where id = v_order.order_id;

  return query select v_order.order_id, v_order.amount_total, v_order.currency;
end;
$$;

revoke execute on function create_whatsapp_order from public, anon, authenticated;
grant execute on function create_whatsapp_order to service_role;
