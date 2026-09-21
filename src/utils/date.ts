/** Primer día del mes de `date`, en ISO ('YYYY-MM-DD'). */
export function monthIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}-01`;
}

/** Suma (o resta, con `delta` negativo) meses a un mes ISO ('YYYY-MM-DD', día 1). */
export function addMonthsIso(month: string, delta: number): string {
  const [year, m] = month.slice(0, 7).split('-').map(Number);
  return monthIso(new Date(year, m - 1 + delta, 1));
}

/** Últimos `count` meses hasta `month` inclusive, en orden ascendente. */
export function lastMonthsIso(month: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonthsIso(month, i - (count - 1)));
}

function dateToIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Fecha de hoy en ISO ('YYYY-MM-DD'), hora local. */
export function todayIso(): string {
  return dateToIso(new Date());
}

/** Suma (o resta, con `delta` negativo) días a una fecha ISO ('YYYY-MM-DD'). */
export function addDaysIso(dateIso: string, delta: number): string {
  const [year, month, day] = dateIso.split('-').map(Number);
  return dateToIso(new Date(year, month - 1, day + delta));
}

/** Últimas `count` fechas ISO hasta `dateIso` inclusive, en orden ascendente. */
export function lastDatesIso(dateIso: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDaysIso(dateIso, i - (count - 1)));
}
