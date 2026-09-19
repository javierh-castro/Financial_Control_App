import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { getMonthlySummary, getRecentTransactions } from '@/data/transactions';
import { useAuth } from '@/providers/auth-provider';
import type { MonthlySummary, Transaction } from '@/types/finance';

const RECENT_TRANSACTIONS_LIMIT = 5;

/** Primer día del mes actual, en ISO ('YYYY-MM-DD'). */
function currentMonthIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}-01`;
}

type HomeData = {
  summary: MonthlySummary;
  transactions: Transaction[];
  loading: boolean;
  /** Vuelve a leer de la base; llamar después de agregar un movimiento. */
  reload: () => Promise<void>;
};

const emptySummary: MonthlySummary = { month: currentMonthIso(), income: 0, expenses: 0 };

/**
 * Datos del Home leídos de SQLite: resumen del mes y últimos movimientos,
 * siempre filtrados por el usuario autenticado (`session.user.id`).
 */
export function useHomeData(): HomeData {
  const db = useSQLiteContext();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [summary, setSummary] = useState<MonthlySummary>(emptySummary);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const month = currentMonthIso();
    const [summaryResult, recent] = await Promise.all([
      getMonthlySummary(db, userId, month),
      getRecentTransactions(db, userId, RECENT_TRANSACTIONS_LIMIT),
    ]);
    setSummary(summaryResult);
    setTransactions(recent);
    setLoading(false);
  }, [db, userId]);

  useEffect(() => {
    // Patrón de fetch-en-efecto recomendado por React (setState llega
    // después del await, no sincrónico); la regla del compilador no
    // distingue eso: https://react.dev/learn/you-might-not-need-an-effect#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return { summary, transactions, loading, reload };
}
