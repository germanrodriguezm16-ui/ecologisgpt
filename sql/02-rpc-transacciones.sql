-- 02-rpc-transacciones.sql
-- SQL para crear función RPC atómica que inserta una transacción y actualiza balances
-- Ejecutar en Supabase SQL editor. NO reemplaza la tabla `transacciones` existente.

-- 0) Recomendación: crea un backup antes de ejecutar cualquier cambio
-- CREATE TABLE public.transacciones_backup AS TABLE public.transacciones WITH DATA;

-- 1) Añadir columnas opcionales si no existen (voucher_type y updated_at)
ALTER TABLE public.transacciones
  ADD COLUMN IF NOT EXISTS voucher_type text;

ALTER TABLE public.transacciones
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2) Crear (o reemplazar) la función RPC que inserta la transacción y actualiza balances
-- Nota: ajusta los tipos (uuid/numeric/timestamptz) si tu modelo difiere
create or replace function public.insert_transaccion_and_update_balances(
  p_origen_categoria_id uuid,
  p_origen_socio_id uuid,
  p_destino_categoria_id uuid,
  p_destino_socio_id uuid,
  p_valor numeric,
  p_fecha timestamptz,
  p_comentario text,
  p_voucher_url text,
  p_voucher_type text
) returns table (
  id uuid,
  fecha timestamptz,
  valor numeric,
  origen_categoria_id uuid,
  origen_socio_id uuid,
  destino_categoria_id uuid,
  destino_socio_id uuid,
  comentario text,
  voucher_url text,
  created_at timestamptz
) language plpgsql security definer as $$
declare
  v_id uuid;
  v_created timestamptz;
begin
  -- Validaciones
  if p_origen_socio_id is null or p_destino_socio_id is null then
    raise exception 'Origen y destino deben estar definidos';
  end if;
  if p_origen_socio_id = p_destino_socio_id then
    raise exception 'Origen y destino no pueden ser el mismo socio';
  end if;
  if p_valor is null or p_valor <= 0 then
    raise exception 'El valor debe ser mayor que cero';
  end if;
  if p_fecha is null then
    p_fecha := now();
  end if;

  -- Inserta la transacción
  insert into public.transacciones(
    fecha, valor, origen_categoria_id, destino_categoria_id,
    origen_socio_id, destino_socio_id, comentario, voucher_url, voucher_type, created_at
  ) values (
    p_fecha, p_valor, p_origen_categoria_id, p_destino_categoria_id,
    p_origen_socio_id, p_destino_socio_id, p_comentario, p_voucher_url, p_voucher_type, now()
  )
  returning id, fecha, valor, origen_categoria_id, origen_socio_id,
  -- Validar que los socios pertenecen a las categorías indicadas
  if not exists (select 1 from public.socios where id = p_origen_socio_id and categoria_id = p_origen_categoria_id) then
    raise exception 'El socio de origen no pertenece a la categoría indicada';
  end if;
  if not exists (select 1 from public.socios where id = p_destino_socio_id and categoria_id = p_destino_categoria_id) then
    raise exception 'El socio de destino no pertenece a la categoría indicada';
  end if;
            destino_categoria_id, destino_socio_id, comentario, voucher_url, created_at
  into v_id, fecha, valor, origen_categoria_id, origen_socio_id,
       destino_categoria_id, destino_socio_id, comentario, voucher_url, v_created;

  -- Actualiza balances (asumiendo columna 'balance' numeric en public.socios)
  update public.socios
    set balance = coalesce(balance,0) - p_valor
    where id = p_origen_socio_id;

  update public.socios
    set balance = coalesce(balance,0) + p_valor
    where id = p_destino_socio_id;

  -- Retornar la fila creada
  return query
    select v_id as id, v_created as fecha, p_valor as valor,
           p_origen_categoria_id as origen_categoria_id, p_origen_socio_id as origen_socio_id,
           p_destino_categoria_id as destino_categoria_id, p_destino_socio_id as destino_socio_id,
           p_comentario as comentario, p_voucher_url as voucher_url, v_created as created_at;
end;
$$;

-- 3) GRANT execute a role authenticated (ajusta si usas otro role)
grant execute on function public.insert_transaccion_and_update_balances(uuid, uuid, uuid, uuid, numeric, timestamptz, text, text, text) to authenticated;

-- 4) Ejemplo de uso (simular desde SQL editor) — reemplaza los UUIDs por valores reales
-- select * from public.insert_transaccion_and_update_balances(
--   'origen_cat_uuid'::uuid,
--   'origen_socio_uuid'::uuid,
--   'dest_cat_uuid'::uuid,
--   'dest_socio_uuid'::uuid,
--   150000.00,
--   now(),
--   'Pago por servicio X',
--   null,
--   null
-- );

-- 5) Notas:
-- - Si tu columna de id en socios no es uuid, reemplaza los tipos en la firma de la función.
-- - Revisa las políticas RLS: la función se ejecuta con permisos del owner (security definer),
--   por tanto no necesita permisos de write directos para el role autenticado sobre 'socios',
--   pero conviene revisar que la política no bloquee la lectura necesaria para otras consultas.
