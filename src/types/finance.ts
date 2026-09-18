import type Ionicons from '@expo/vector-icons/Ionicons';

export type IconName = keyof typeof Ionicons.glyphMap;

export type TransactionKind = 'income' | 'expense';

export type Transaction = {
  id: string;
  /** Descripción que ve el usuario, por ejemplo "Supermercado". */
  title: string;
  /** Categoría a la que se imputa el movimiento. */
  category: string;
  /** Monto siempre positivo; el signo lo define `kind`. */
  amount: number;
  kind: TransactionKind;
  /** Fecha en formato ISO (YYYY-MM-DD). */
  date: string;
  icon: IconName;
};

/** Resumen del período que se muestra en la tarjeta de saldo. */
export type MonthlySummary = {
  /** Mes del resumen, en ISO (YYYY-MM-DD, día 1). */
  month: string;
  income: number;
  expenses: number;
};
