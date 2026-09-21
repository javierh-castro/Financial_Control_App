import type { SQLiteDatabase } from 'expo-sqlite';

/** Nombre del archivo de base de datos en el dispositivo. */
export const DATABASE_NAME = 'gastos.db';

const DATABASE_VERSION = 5;

/**
 * Crea/actualiza el esquema local vía `PRAGMA user_version`, siguiendo el
 * patrón recomendado por Expo SQLite. Toda la migración corre dentro de
 * una única transacción exclusiva: si el proceso se interrumpe a mitad de
 * camino, `user_version` no llega a actualizarse, nada de lo hecho queda
 * a medio commitear, y el próximo arranque reintenta la migración
 * completa desde cero (transaccional e idempotente).
 *
 * v1 → v2 (Entrega 2, multiusuario + preparación de sync offline-first):
 * la tabla `transactions` de la Entrega 1 no tenía `user_id` ni
 * `category_id`, y traía datos de ejemplo sembrados (t-1/t-2/t-3) que no
 * encajan en el esquema nuevo. No se borran a ciegas: la tabla vieja se
 * archiva completa como `legacy_transactions_v1` (queda en el archivo de
 * base de datos, fuera de cualquier consulta y de cualquier sync futuro).
 * Una instalación nueva (v0) no pasa por ese archivado: arranca
 * directamente con el esquema v2, sin sembrado.
 *
 * v2 → v3 (Entrega 3B, método de pago): agrega `payment_method` a
 * `transactions` (espejo de `supabase/migrations/0002_add_payment_method.sql`).
 * Solo hace falta el `ALTER TABLE` para instalaciones que ya tenían la
 * tabla en v2; una instalación v0/v1 llega directo al `CREATE TABLE` de
 * abajo, que ya incluye la columna.
 *
 * v3 → v4 (Entrega 4, Ajustes): agrega `user_preferences` (espejo de
 * `supabase/migrations/0003_add_user_preferences.sql`), una fila por
 * usuario con sus preferencias sincronizables (hoy solo notificaciones).
 * Al ser tabla nueva no hace falta rama de migración propia: el `CREATE
 * TABLE IF NOT EXISTS` de abajo alcanza para v0, v1, v2 y v3 por igual.
 *
 * v4 → v5: sin cambios de esquema. Solo fuerza a re-correr la migración
 * en instalaciones que ya habían quedado en `user_version = 4` antes de
 * que `user_preferences` se agregara al bloque `CREATE TABLE IF NOT
 * EXISTS`, dejándolas sin esa tabla pese a reportar v4.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  // No se puede cambiar journal_mode dentro de una transacción explícita.
  await db.execAsync("PRAGMA journal_mode = 'wal';");

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    if (currentVersion === 1) {
      await txn.execAsync('ALTER TABLE transactions RENAME TO legacy_transactions_v1;');
    }

    if (currentVersion === 2) {
      await txn.execAsync(`
        ALTER TABLE transactions ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cash'
          CHECK (payment_method IN ('cash', 'card', 'transfer'));
      `);
    }

    await txn.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
        last_sync_error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_categories_user ON categories (user_id);
      CREATE INDEX IF NOT EXISTS idx_categories_sync_status ON categories (sync_status);

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        category_id TEXT REFERENCES categories (id),
        title TEXT NOT NULL,
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
        date TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
        last_sync_error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions (user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
      CREATE INDEX IF NOT EXISTS idx_transactions_sync_status ON transactions (sync_status);

      CREATE TABLE IF NOT EXISTS sync_metadata (
        user_id TEXT PRIMARY KEY NOT NULL,
        last_synced_at TEXT,
        last_cursor TEXT
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY NOT NULL,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
        last_sync_error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_user_preferences_sync_status ON user_preferences (sync_status);
    `);

    await txn.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}
