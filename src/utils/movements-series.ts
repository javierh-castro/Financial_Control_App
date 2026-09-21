import { formatDateWithYear, formatMonth, formatMonthAbbr, formatShortDate, formatWeekdayShort } from '@/utils/format';

export type MovementsPoint = {
  key: string;
  /** Etiqueta corta para el eje X (p. ej. "Vie 12", "Sem 3", "Oct–Nov"). */
  label: string;
  /** Descripción legible del período, para el tooltip (p. ej. "12 sept. 2026", "Sem 3 (15-21 sept.)"). */
  periodLabel: string;
  income: number;
  expenses: number;
};

type DailyTotalsRow = { date: string; income: number; expenses: number };
type MonthlyTotalsRow = { month: string; income: number; expenses: number };

const WEEK_SIZE = 7;
const BIMONTH_SIZE = 2;

/**
 * Un punto por cada fecha de `dates` (se espera que sean los últimos 7
 * días, terminando hoy). Completa con ceros las fechas sin movimientos:
 * sin esto, la semana quedaría con huecos en el eje X.
 */
export function lastDaysMovementsPoints(dates: string[], rows: DailyTotalsRow[]): MovementsPoint[] {
  const byDate = new Map(rows.map((row) => [row.date, row]));

  return dates.map((date) => {
    const row = byDate.get(date);
    const day = Number(date.slice(8, 10));
    return {
      key: date,
      label: `${formatWeekdayShort(date)} ${day}`,
      periodLabel: formatDateWithYear(date),
      income: row?.income ?? 0,
      expenses: row?.expenses ?? 0,
    };
  });
}

/**
 * `dates` (se esperan los últimos 28 días, terminando hoy) agrupados en
 * 4 bloques consecutivos de 7 días ("Sem 1".."Sem 4"), de más antiguo a
 * más reciente.
 */
export function fourWeeksMovementsPoints(dates: string[], rows: DailyTotalsRow[]): MovementsPoint[] {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  const weeks: MovementsPoint[] = [];

  for (let start = 0; start < dates.length; start += WEEK_SIZE) {
    const chunk = dates.slice(start, start + WEEK_SIZE);
    const income = chunk.reduce((sum, date) => sum + (byDate.get(date)?.income ?? 0), 0);
    const expenses = chunk.reduce((sum, date) => sum + (byDate.get(date)?.expenses ?? 0), 0);
    const index = weeks.length + 1;
    weeks.push({
      key: `week-${index}`,
      label: `Sem ${index}`,
      periodLabel: `Sem ${index} (${formatShortDate(chunk[0])} - ${formatShortDate(chunk[chunk.length - 1])})`,
      income,
      expenses,
    });
  }

  return weeks;
}

/**
 * `months` (se esperan los últimos 12 meses ISO, día 1, terminando en el
 * mes actual) agrupados en 6 bloques consecutivos de 2 meses calendario
 * ("Oct–Nov", "Dic–Ene", ...), de más antiguo a más reciente.
 */
export function sixBimonthlyMovementsPoints(months: string[], rows: MonthlyTotalsRow[]): MovementsPoint[] {
  const byMonth = new Map(rows.map((row) => [row.month, row]));
  const groups: MovementsPoint[] = [];

  for (let start = 0; start < months.length; start += BIMONTH_SIZE) {
    const chunk = months.slice(start, start + BIMONTH_SIZE);
    const income = chunk.reduce((sum, month) => sum + (byMonth.get(month.slice(0, 7))?.income ?? 0), 0);
    const expenses = chunk.reduce((sum, month) => sum + (byMonth.get(month.slice(0, 7))?.expenses ?? 0), 0);
    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    groups.push({
      key: first.slice(0, 7),
      label: `${formatMonthAbbr(first)}–${formatMonthAbbr(last)}`,
      periodLabel: `${formatMonth(first)} – ${formatMonth(last)}`,
      income,
      expenses,
    });
  }

  return groups;
}

export type MovementsAxisRange = {
  /** Distancia entre líneas de grilla, redondeada a un número "lindo" (1/2/5 × 10ⁿ). */
  step: number;
  /** Cantidad de líneas de grilla arriba del 0 (sin contar el propio 0). */
  sections: number;
  /** `step * sections`: el tope superior del eje. */
  maxValue: number;
};

/** Total de líneas horizontales pedido por diseño: el 0 más 7 secciones arriba. */
const SECTIONS = 7;

/**
 * Redondea `rawStep` al próximo paso "lindo" (1, 2, 3, 5 o 10 × una
 * potencia de 10). El escalón de "3" es a propósito: con solo 1/2/5/10
 * el paso salta de 20.000 a 50.000 para montos de unos 210.000 (7
 * secciones de 30.000 encajarían justo), dejando la mitad de la tarjeta
 * vacía arriba de la barra más alta.
 */
function niceStep(rawStep: number): number {
  if (rawStep <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const niceResidual =
    residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 3 ? 3 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

/**
 * Rango del eje vertical: siempre arranca en 0 y se adapta al valor más
 * alto entre ingresos y gastos de los períodos visibles (nunca a la
 * suma de ambos, porque las barras se dibujan una al lado de la otra,
 * no apiladas). Sin margen extra: el paso "lindo" más chico que ya
 * alcanza a cubrir el valor máximo, sin agrandar de más el eje.
 * `Math.max(1, ...)` evita NaN cuando todos los valores son cero (mes
 * sin movimientos).
 */
export function movementsAxisRange(points: MovementsPoint[]): MovementsAxisRange {
  const maxFlow = Math.max(1, ...points.flatMap((point) => [point.income, point.expenses]));
  const step = niceStep(maxFlow / SECTIONS);
  return { step, sections: SECTIONS, maxValue: step * SECTIONS };
}
