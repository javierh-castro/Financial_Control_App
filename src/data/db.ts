import type { SQLiteDatabase } from 'expo-sqlite';

import { seedTransactions } from '@/data/sample-data';

/** Nombre del archivo de base de datos en el dispositivo. */
export const DATABASE_NAME = 'gastos.db';

const DATABASE_VERSION = 1;

/**
 * Crea el esquema y siembra datos de ejemplo la primera vez que corre la
 * app. Usa `PRAGMA user_version` para no repetir migraciones ya aplicadas,
 * siguiendo el patrón recomendado por Expo SQLite.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
        date TEXT NOT NULL,
        icon TEXT NOT NULL
      );
      CREATE INDEX idx_transactions_date ON transactions (date);
    `);

    const insert = await db.prepareAsync(
      `INSERT INTO transactions (id, title, category, amount, kind, date, icon)
       VALUES ($id, $title, $category, $amount, $kind, $date, $icon)`
    );
    try {
      for (const transaction of seedTransactions) {
        await insert.executeAsync({
          $id: transaction.id,
          $title: transaction.title,
          $category: transaction.category,
          $amount: transaction.amount,
          $kind: transaction.kind,
          $date: transaction.date,
          $icon: transaction.icon,
        });
      }
    } finally {
      await insert.finalizeAsync();
    }

    currentDbVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
