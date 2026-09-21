import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import {
  getCurrentBalance,
  getDailyTotalsForRange,
  getMonthlyTotalsForRange,
} from '@/data/movements-analytics';
import { getTransactionsForMonth } from '@/data/transactions';
import { useAuth } from '@/providers/auth-provider';
import type { Transaction } from '@/types/finance';
import { lastDatesIso, lastMonthsIso, monthIso, todayIso } from '@/utils/date';
import {
  fourWeeksMovementsPoints,
  lastDaysMovementsPoints,
  sixBimonthlyMovementsPoints,
  type MovementsPoint,
} from '@/utils/movements-series';

export type MovementsGranularity = 'day' | 'month' | 'year';

type MovementsData = {
  granularity: MovementsGranularity;
  setGranularity: (granularity: MovementsGranularity) => void;
  /** Saldo real de todos los movimientos del usuario hasta hoy. */
  currentBalance: number;
  points: MovementsPoint[];
  /** Movimientos del mes calendario en curso, para "Movimientos recientes". */
  transactions: Transaction[];
  loading: boolean;
  /** Vuelve a leer de la base; llamar después de agregar un movimiento. */
  reload: () => Promise<void>;
};

const DAY_WINDOW = 7;
const MONTH_WINDOW = 28;
const YEAR_WINDOW_MONTHS = 12;

/**
 * Datos de la pantalla "Movimientos": la serie del gráfico según la
 * granularidad activa y el listado de movimientos del mes en curso.
 *
 * Cada modo muestra siempre la ventana más reciente terminando hoy
 * ("Día" → últimos 7 días, "Mes" → últimas 4 semanas, "Año" → últimos 12
 * meses agrupados de a 2): no hay navegación a períodos anteriores.
 *
 * Toda la agregación vive en `data/movements-analytics.ts` y
 * `utils/movements-series.ts`; este hook solo orquesta la carga.
 */
export function useMovementsData(): MovementsData {
  const db = useSQLiteContext();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [granularity, setGranularity] = useState<MovementsGranularity>('day');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [points, setPoints] = useState<MovementsPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const today = todayIso();
    const currentMonth = monthIso(new Date());

    let pointsPromise: Promise<MovementsPoint[]>;
    if (granularity === 'year') {
      const months = lastMonthsIso(currentMonth, YEAR_WINDOW_MONTHS);
      pointsPromise = getMonthlyTotalsForRange(
        db,
        userId,
        months[0].slice(0, 7),
        months[months.length - 1].slice(0, 7)
      ).then((rows) => sixBimonthlyMovementsPoints(months, rows));
    } else {
      const windowSize = granularity === 'month' ? MONTH_WINDOW : DAY_WINDOW;
      const dates = lastDatesIso(today, windowSize);
      pointsPromise = getDailyTotalsForRange(db, userId, dates[0], dates[dates.length - 1]).then((rows) =>
        granularity === 'month' ? fourWeeksMovementsPoints(dates, rows) : lastDaysMovementsPoints(dates, rows)
      );
    }

    const [nextPoints, monthTransactions, balance] = await Promise.all([
      pointsPromise,
      getTransactionsForMonth(db, userId, currentMonth),
      getCurrentBalance(db, userId),
    ]);

    setPoints(nextPoints);
    setTransactions(monthTransactions);
    setCurrentBalance(balance);
    setLoading(false);
  }, [db, userId, granularity]);

  useEffect(() => {
    // Patrón de fetch-en-efecto recomendado por React (setState llega
    // después del await, no sincrónico); la regla del compilador no
    // distingue eso: https://react.dev/learn/you-might-not-need-an-effect#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return {
    granularity,
    setGranularity,
    currentBalance,
    points,
    transactions,
    loading,
    reload,
  };
}
