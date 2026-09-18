/**
 * Datos de ejemplo de la primera etapa. Se reemplazan por el almacenamiento
 * real (y más adelante la sincronización) sin tocar los componentes: todos
 * reciben lo que muestran por props.
 */

import type { MonthlySummary, Transaction } from '@/types/finance';

export const currentSummary: MonthlySummary = {
  month: '2026-09-01',
  income: 320000,
  expenses: 215400,
};

export const recentTransactions: Transaction[] = [
  {
    id: 't-1',
    title: 'Supermercado',
    category: 'Alimentación',
    amount: 12800,
    kind: 'expense',
    date: '2026-09-15',
    icon: 'cart-outline',
  },
  {
    id: 't-2',
    title: 'Sueldo freelance',
    category: 'Ingreso',
    amount: 120000,
    kind: 'income',
    date: '2026-09-14',
    icon: 'briefcase-outline',
  },
  {
    id: 't-3',
    title: 'Transporte',
    category: 'Transporte',
    amount: 3200,
    kind: 'expense',
    date: '2026-09-12',
    icon: 'bus-outline',
  },
];

/** Saldo disponible del período. */
export function availableBalance(summary: MonthlySummary): number {
  return summary.income - summary.expenses;
}
