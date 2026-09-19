-- =========================================================
-- 0001_init.sql — Entrega 1: esquema remoto, RLS, auth
-- =========================================================

-- ---------- profiles ----------
-- 1:1 con auth.users; "id" ya identifica al usuario, no lleva user_id
-- aparte (sería duplicado).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- categories ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text not null,
  kind text not null check (kind in ('income', 'expense')),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- transactions ----------
-- Sin icon/nombre de categoría: viven solo en categories (se joinea
-- por category_id). amount_cents entero, no numeric.
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  title text not null,
  amount_cents bigint not null check (amount_cents > 0),
  kind text not null check (kind in ('income', 'expense')),
  date date not null,
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Cursor estable de pull: (user_id, updated_at, id) evita perder filas
-- con el mismo updated_at.
create index categories_sync_cursor on categories (user_id, updated_at, id);
create index transactions_sync_cursor on transactions (user_id, updated_at, id);
create index transactions_by_date on transactions (user_id, date);

-- ---------- updated_at + version (concurrencia optimista) ----------
-- version sube en cada UPDATE. El push del cliente manda
-- `eq('version', version_conocida)`: si no matchea ninguna fila, hubo
-- un cambio remoto más nuevo y el push no pisa nada.
create or replace function bump_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.version = old.version + 1;
  return new;
end;
$$;

create trigger trg_categories_bump
  before update on categories
  for each row execute function bump_version();

create trigger trg_transactions_bump
  before update on transactions
  for each row execute function bump_version();

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;

create policy "select own profile" on profiles
  for select using (auth.uid() = id);
create policy "update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- Sin policy de insert/delete: el perfil lo crea handle_new_user.

-- Bloqueo de "role" a nivel de columna (no alcanza con RLS de fila):
-- el cliente nunca puede promoverse a admin, ni aunque intente un
-- UPDATE directo.
revoke update, insert on profiles from authenticated;
grant update (full_name) on profiles to authenticated;

-- categories: select/insert/update separados, sin delete. Borrar un
-- movimiento u categoría es actualizar deleted_at (para que
-- sincronice como cualquier otro cambio), nunca un DELETE real.
create policy "select own categories" on categories
  for select using (auth.uid() = user_id);
create policy "insert own categories" on categories
  for insert with check (auth.uid() = user_id);
create policy "update own categories" on categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke delete on categories from authenticated;

create policy "select own transactions" on transactions
  for select using (auth.uid() = user_id);
create policy "insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);
create policy "update own transactions" on transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke delete on transactions from authenticated;

-- ---------- signup: perfil + categorías por default ----------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.categories (user_id, name, icon, kind) values
    (new.id, 'Alimentación', 'cart-outline', 'expense'),
    (new.id, 'Transporte', 'bus-outline', 'expense'),
    (new.id, 'Ingreso', 'briefcase-outline', 'income');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
