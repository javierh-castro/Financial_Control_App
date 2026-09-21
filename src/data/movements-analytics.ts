import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Consultas de agregación para el gráfico de movimientos. Separadas de
 * `transactions.ts` (que es CRUD/listados) a propósito: acá vive todo el
 * cálculo de datos, así el componente visual (`MovementsChart`) solo
 * arma la UI a partir de números que ya vienen resueltos.
 *
 * Todas filtran por `user_id` y `deleted_at IS NULL`, igual que el resto
 * de las consultas de movimientos. Los montos siguen en `amount_cents`;
 * acá también se devuelven ya convertidos a unidades de moneda.
 */

/** Saldo acumulado de todos los movimientos del usuario hasta hoy: lo que se muestra como "Saldo actual". */
export async function getCurrentBalance(db: SQLiteDatabase, userId: string): Promise<number> {
  const row = await db.getFirstAsync<{ balance: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_cents ELSE -amount_cents END), 0) / 100.0 AS balance
     FROM transactions
     WHERE user_id = ? AND deleted_at IS NULL`,
    userId
  );
  return row?.balance ?? 0;
}

export type DailyTotalsRow = { date: string; income: number; expenses: number };

/**
 * Ingresos y gastos por día dentro de un rango de fechas ISO (inclusive
 * en ambos extremos). Solo trae los días con movimientos; completar los
 * días sin datos queda para quien arma la serie del gráfico.
 */
export async function getDailyTotalsForRange(
  db: SQLiteDatabase,
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyTotalsRow[]> {
  return db.getAllAsync<DailyTotalsRow>(
    `SELECT
       date AS date,
       COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_cents ELSE 0 END), 0) / 100.0 AS income,
       COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_cents ELSE 0 END), 0) / 100.0 AS expenses
     FROM transactions
     WHERE user_id = ? AND deleted_at IS NULL AND date BETWEEN ? AND ?
     GROUP BY date`,
    userId,
    startDate,
    endDate
  );
}

export type MonthlyTotalsRow = { month: string; income: number; expenses: number };

/**
 * Ingresos y gastos por mes ('YYYY-MM') dentro de un rango de meses ISO
 * ('YYYY-MM', inclusive en ambos extremos). Puede cruzar años calendario.
 */
export async function getMonthlyTotalsForRange(
  db: SQLiteDatabase,
  userId: string,
  startMonth: string,
  endMonth: string
): Promise<MonthlyTotalsRow[]> {
  return db.getAllAsync<MonthlyTotalsRow>(
    `SELECT
       substr(date, 1, 7) AS month,
       COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_cents ELSE 0 END), 0) / 100.0 AS income,
       COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount_cents ELSE 0 END), 0) / 100.0 AS expenses
     FROM transactions
     WHERE user_id = ? AND deleted_at IS NULL AND substr(date, 1, 7) BETWEEN ? AND ?
     GROUP BY substr(date, 1, 7)`,
    userId,
    startMonth,
    endMonth
  );
}
