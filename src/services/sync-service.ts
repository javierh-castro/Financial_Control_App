import type { PostgrestError } from '@supabase/supabase-js';
import * as Network from 'expo-network';
import type { SQLiteDatabase } from 'expo-sqlite';

import { supabase } from '@/lib/supabase';

/**
 * Sincronización offline-first entre SQLite y Supabase (Entrega 3).
 *
 * Política V1: "última escritura exitosa gana" — no hay merge de
 * conflictos por versión; se empuja lo pendiente y después se trae todo
 * de nuevo, y lo que devuelve Supabase pisa lo local. `legacy_transactions_v1`
 * (movimientos de ejemplo de la Entrega 1) nunca se toca acá: esta
 * sincronización solo conoce `categories` y `transactions`.
 */

type LocalCategoryRow = {
  id: string;
  name: string;
  icon: string;
  kind: string;
  deleted_at: string | null;
};

type LocalTransactionRow = {
  id: string;
  category_id: string | null;
  title: string;
  amount_cents: number;
  kind: string;
  date: string;
  deleted_at: string | null;
};

type RemoteCategoryRow = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  kind: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type RemoteTransactionRow = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  amount_cents: number;
  kind: string;
  date: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

// Sincronizaciones en curso por usuario: evita que dos disparadores
// (AppState, reconexión de red, login) corran una sincronización en
// paralelo para el mismo usuario. Un llamador concurrente se une a la
// que ya está en marcha en vez de arrancar otra.
const inFlightByUser = new Map<string, Promise<void>>();

/**
 * Traduce un error de Postgrest/red a un mensaje seguro para guardar en
 * `last_sync_error`. Nunca usa `error.message`/`details` tal cual: esos
 * campos pueden traer de vuelta valores de la fila (títulos, montos).
 */
function describeSyncError(error: unknown): string {
  const code = (error as Partial<PostgrestError> | null)?.code;
  switch (code) {
    case '23505':
      return 'Conflicto: ya existe un registro con ese id.';
    case '23503':
      return 'Referencia inválida (categoría inexistente).';
    case '42501':
    case 'PGRST301':
      return 'Sin permiso para sincronizar este registro.';
    default:
      return 'No se pudo sincronizar este registro. Se reintentará.';
  }
}

async function isOnline(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  return Boolean(state.isConnected) && (state.isInternetReachable ?? true);
}

/** Empuja las categorías pendientes/fallidas. Devuelve false si alguna falló. */
async function pushCategories(db: SQLiteDatabase, userId: string): Promise<boolean> {
  const pending = await db.getAllAsync<LocalCategoryRow>(
    `SELECT id, name, icon, kind, deleted_at
     FROM categories
     WHERE user_id = ? AND sync_status IN ('pending', 'failed')`,
    userId
  );

  let allOk = true;
  for (const category of pending) {
    // Nunca se manda sync_status/last_sync_error: son metadatos locales,
    // la tabla remota ni tiene esas columnas. El id local (UUID) es la
    // clave del upsert: reintentar el mismo registro nunca duplica fila.
    const { error } = await supabase.from('categories').upsert(
      {
        id: category.id,
        user_id: userId,
        name: category.name,
        icon: category.icon,
        kind: category.kind,
        deleted_at: category.deleted_at,
      },
      { onConflict: 'id' }
    );

    if (error) {
      allOk = false;
      await db.runAsync(
        `UPDATE categories SET sync_status = 'failed', last_sync_error = ? WHERE id = ?`,
        describeSyncError(error),
        category.id
      );
    } else {
      await db.runAsync(
        `UPDATE categories SET sync_status = 'synced', last_sync_error = NULL WHERE id = ?`,
        category.id
      );
    }
  }
  return allOk;
}

/** Empuja las transacciones pendientes/fallidas. Devuelve false si alguna falló. */
async function pushTransactions(db: SQLiteDatabase, userId: string): Promise<boolean> {
  const pending = await db.getAllAsync<LocalTransactionRow>(
    `SELECT id, category_id, title, amount_cents, kind, date, deleted_at
     FROM transactions
     WHERE user_id = ? AND sync_status IN ('pending', 'failed')`,
    userId
  );

  let allOk = true;
  for (const transaction of pending) {
    const { error } = await supabase.from('transactions').upsert(
      {
        id: transaction.id,
        user_id: userId,
        category_id: transaction.category_id,
        title: transaction.title,
        amount_cents: transaction.amount_cents,
        kind: transaction.kind,
        date: transaction.date,
        deleted_at: transaction.deleted_at,
      },
      { onConflict: 'id' }
    );

    if (error) {
      allOk = false;
      await db.runAsync(
        `UPDATE transactions SET sync_status = 'failed', last_sync_error = ? WHERE id = ?`,
        describeSyncError(error),
        transaction.id
      );
    } else {
      await db.runAsync(
        `UPDATE transactions SET sync_status = 'synced', last_sync_error = NULL WHERE id = ?`,
        transaction.id
      );
    }
  }
  return allOk;
}

/**
 * Trae todas las categories/transactions del usuario y las escribe en
 * SQLite dentro de una sola transacción (todo o nada). Nunca borra filas
 * locales: los `deleted_at` remotos se aplican como update (borrado
 * lógico), y una fila local todavía no pusheada (no existe en Supabase)
 * no aparece en la respuesta, así que este paso no la toca.
 */
async function pullAndApply(db: SQLiteDatabase, userId: string): Promise<void> {
  const [categoriesResult, transactionsResult] = await Promise.all([
    supabase.from('categories').select('*').eq('user_id', userId),
    supabase.from('transactions').select('*').eq('user_id', userId),
  ]);

  if (categoriesResult.error) throw categoriesResult.error;
  if (transactionsResult.error) throw transactionsResult.error;

  const categories = (categoriesResult.data ?? []) as RemoteCategoryRow[];
  const transactions = (transactionsResult.data ?? []) as RemoteTransactionRow[];

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const category of categories) {
      await txn.runAsync(
        `INSERT INTO categories
           (id, user_id, name, icon, kind, version, created_at, updated_at, deleted_at, sync_status, last_sync_error)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL)
         ON CONFLICT(id) DO UPDATE SET
           user_id = excluded.user_id,
           name = excluded.name,
           icon = excluded.icon,
           kind = excluded.kind,
           version = excluded.version,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at,
           sync_status = 'synced',
           last_sync_error = NULL`,
        category.id,
        category.user_id,
        category.name,
        category.icon,
        category.kind,
        category.version,
        category.created_at,
        category.updated_at,
        category.deleted_at
      );
    }

    for (const transaction of transactions) {
      await txn.runAsync(
        `INSERT INTO transactions
           (id, user_id, category_id, title, amount_cents, kind, date, version, created_at, updated_at, deleted_at, sync_status, last_sync_error)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', NULL)
         ON CONFLICT(id) DO UPDATE SET
           user_id = excluded.user_id,
           category_id = excluded.category_id,
           title = excluded.title,
           amount_cents = excluded.amount_cents,
           kind = excluded.kind,
           date = excluded.date,
           version = excluded.version,
           created_at = excluded.created_at,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at,
           sync_status = 'synced',
           last_sync_error = NULL`,
        transaction.id,
        transaction.user_id,
        transaction.category_id,
        transaction.title,
        transaction.amount_cents,
        transaction.kind,
        transaction.date,
        transaction.version,
        transaction.created_at,
        transaction.updated_at,
        transaction.deleted_at
      );
    }
  });
}

async function runSync(db: SQLiteDatabase, userId: string): Promise<void> {
  if (!(await isOnline())) {
    // Requisito: sin Internet, termina en silencio y no toca nada local.
    return;
  }

  let hadErrors = false;
  try {
    const categoriesOk = await pushCategories(db, userId);
    const transactionsOk = await pushTransactions(db, userId);
    hadErrors = !categoriesOk || !transactionsOk;

    await pullAndApply(db, userId);
  } catch {
    // Error de red/servidor a mitad de camino: los registros pendientes
    // quedan como estaban (o 'failed' con motivo), listos para reintentar
    // en la próxima sincronización. No se propaga la excepción.
    hadErrors = true;
  }

  if (!hadErrors) {
    // sync_metadata solo se actualiza tras una sincronización 100% exitosa.
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO sync_metadata (user_id, last_synced_at, last_cursor)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         last_synced_at = excluded.last_synced_at,
         last_cursor = excluded.last_cursor`,
      userId,
      now,
      now
    );
  }
}

/**
 * Punto de entrada del servicio. Nunca lanza: los errores quedan
 * reflejados en `sync_status`/`last_sync_error` de cada fila, no como
 * excepción para quien llama. Si ya hay una sincronización en curso para
 * este usuario, se devuelve esa misma promesa en vez de arrancar otra.
 */
export function syncNow(db: SQLiteDatabase, userId: string): Promise<void> {
  const existing = inFlightByUser.get(userId);
  if (existing) {
    return existing;
  }

  const run = runSync(db, userId).finally(() => {
    inFlightByUser.delete(userId);
  });
  inFlightByUser.set(userId, run);
  return run;
}
