import type { SQLiteDatabase } from 'expo-sqlite';

import type { MonthlySummary, Transaction } from '@/types/finance';

/**
 * Últimos movimientos, del más reciente al más viejo.
 * `rowid` como criterio secundario desempata movimientos del mismo día.
 */
export async function getRecentTransactions(
  db: SQLiteDatabase,
  limit: number
): Promise<Transaction[]> {
  return db.getAllAsync<Transaction>(
    `SELECT id, title, category, amount, kind, date, icon
     FROM transactions
     ORDER BY date DESC, rowid DESC
     LIMIT ?`,
    limit
  );
}

/** Ingresos y gastos totales de un mes (ISO 'YYYY-MM-DD', día 1). */
export async function getMonthlySummary(
  db: SQLiteDatabase,
  month: string
): Promise<MonthlySummary> {
  const monthPrefix = month.slice(0, 7); // 'YYYY-MM'
  const row = await db.getFirstAsync<{ income: number; expenses: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN kind = 'income' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount ELSE 0 END), 0) AS expenses
     FROM transactions
     WHERE date LIKE ? || '%'`,
    monthPrefix
  );

  return {
    month,
    income: row?.income ?? 0,
    expenses: row?.expenses ?? 0,
  };
}

/** Guarda un movimiento nuevo. `transaction.id` debe ser único. */
export async function addTransaction(
  db: SQLiteDatabase,
  transaction: Transaction
): Promise<void> {
  await db.runAsync(
    `INSERT INTO transactions (id, title, category, amount, kind, date, icon)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    transaction.id,
    transaction.title,
    transaction.category,
    transaction.amount,
    transaction.kind,
    transaction.date,
    transaction.icon
  );
}

/** Saldo disponible: ingresos menos gastos del período. */
export function availableBalance(summary: MonthlySummary): number {
  return summary.income - summary.expenses;
}
