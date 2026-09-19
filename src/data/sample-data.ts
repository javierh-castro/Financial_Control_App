/**
 * Datos de ejemplo. Se usan solo para sembrar la base SQLite la primera vez
 * que corre la app (ver `migrateDbIfNeeded` en `src/data/db.ts`), así una
 * instalación nueva no arranca vacía. Los datos reales que ve la app
 * siempre salen de la base, no de este archivo.
 */

import type { Transaction } from '@/types/finance';

export const seedTransactions: Transaction[] = [
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
