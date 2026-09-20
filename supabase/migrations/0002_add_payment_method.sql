-- =========================================================
-- 0002_add_payment_method.sql — Entrega 3B: método de pago
-- =========================================================
-- payment_method vive en transactions (no en categories): es un dato
-- del movimiento ("¿cómo pagaste esto?"), no de la categoría. Se agrega
-- NOT NULL con default 'cash': Postgres backfillea las filas existentes
-- con el default en la misma sentencia, sin dejar filas inválidas.

alter table transactions
  add column payment_method text not null default 'cash'
    check (payment_method in ('cash', 'card', 'transfer'));

-- No hace falta tocar grants ni policies: ya están a nivel de tabla
-- (0001_init.sql) y cubren cualquier columna nueva.
