-- =========================================================
-- 0003_add_user_preferences.sql — Entrega 4: preferencias (Ajustes)
-- =========================================================
-- Una fila por usuario, como sync_metadata en SQLite: nunca se borra
-- mientras el usuario exista (cascade con auth.users), así que no lleva
-- `deleted_at` ni policy de delete.

create table user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notifications_enabled boolean not null default true,
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_preferences_sync_cursor on user_preferences (user_id, updated_at);

create trigger trg_user_preferences_bump
  before update on user_preferences
  for each row execute function bump_version();

revoke all on user_preferences from anon, authenticated;
grant select, insert, update on user_preferences to authenticated;

alter table user_preferences enable row level security;

create policy "select own preferences" on user_preferences
  for select using (auth.uid() = user_id);
create policy "insert own preferences" on user_preferences
  for insert with check (auth.uid() = user_id);
create policy "update own preferences" on user_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- signup: reemplaza handle_new_user (0001_init.sql) ----------
-- Mismo cuerpo que la versión original, sumando la fila de preferencias
-- por default para cada usuario nuevo.
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

  insert into public.user_preferences (user_id) values (new.id);

  return new;
end;
$$;
