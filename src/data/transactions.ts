import type { SQLiteDatabase } from 'expo-sqlite';

import type { MonthlySummary, Transaction, TransactionKind } from '@/types/finance';

/** Datos para crear un movimiento nuevo; `id` lo genera quien llama (UUID). */
export type NewTransaction = {
  id: string;
  categoryId: string | null;
  title: string;
  /** Monto en unidades de moneda (no centavos); se persiste como amount_cents. */
  amount: number;
  kind: TransactionKind;
  /** Fecha en formato ISO (YYYY-MM-DD). */
  date: string;
};

/**
 * Últimos movimientos del usuario, del más reciente al más viejo.
 * `rowid` como criterio secundario desempata movimientos del mismo día.
 * Categoría e ícono salen de un join con `categories`; si la categoría no
 * existe o fue borrada, cae a un ícono/nombre genérico en vez de romper.
 */
export async function getRecentTransactions(
  db: SQLiteDatabase,
  userId: string,
  limit: number
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT
       t.id AS id,
       t.title AS title,
       COALESCE(c.name, 'Sin categoría') AS category,
       t.amount_cents / 100.0 AS amount,
       t.kind AS kind,
       t.date AS date,
       COALESCE(c.icon, 'help-circle-outline') AS icon
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id AND c.deleted_at IS NULL
     WHERE t.user_id = ? AND t.deleted_at IS NULL
     ORDER BY t.date DESC, t.rowid DESC
     LIMIT ?`,
    userId,
    limit
  );
}

/** Ingresos y gastos totales de un mes (ISO 'YYYY-MM-DD', día 1) para el usuario dado. */
export async function getMonthlySummary(
  db: SQLiteDatabase,
  userId: string,
  month: string
): Promise<MonthlySummary> {
  const monthPrefix = month.slice(0, 7); // 'YYYY-MM'
  const row = await db.getFirstAsync<{ income: number; expenses: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_cents ELSE 0 END), 0) / 100.0 AS income,
       COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_cents ELSE 0 END), 0) / 100.0 AS expenses
     FROM transactions
     WHERE user_id = ? AND deleted_at IS NULL AND date LIKE ? || '%'`,
    userId,
    monthPrefix
  );

  return {
    month,
    income: row?.income ?? 0,
    expenses: row?.expenses ?? 0,
  };
}

/**
 * Guarda un movimiento nuevo para el usuario dado. Queda con
 * `sync_status = 'pending'` (default de columna): así se guardan todos los
 * movimientos creados sin Internet, listos para un push futuro.
 */
export async function addTransaction(
  db: SQLiteDatabase,
  userId: string,
  transaction: NewTransaction
): Promise<void> {
  await db.runAsync(
    `INSERT INTO transactions (id, user_id, category_id, title, amount_cents, kind, date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    transaction.id,
    userId,
    transaction.categoryId,
    transaction.title,
    Math.round(transaction.amount * 100),
    transaction.kind,
    transaction.date
  );
}

/** Saldo disponible: ingresos menos gastos del período. */
export function availableBalance(summary: MonthlySummary): number {
  return summary.income - summary.expenses;
}
