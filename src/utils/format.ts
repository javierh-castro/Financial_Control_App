const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MONTHS_SHORT = [
  'ene.',
  'feb.',
  'mar.',
  'abr.',
  'may.',
  'jun.',
  'jul.',
  'ago.',
  'sept.',
  'oct.',
  'nov.',
  'dic.',
];

/** Convierte "2026-09-15" en una fecha local, sin corrimientos por zona horaria. */
function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** `104600` → `"$ 104.600"`. Formato local, sin depender de Intl. */
export function formatAmount(value: number): string {
  const digits = Math.abs(Math.round(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${digits}`;
}

/** `12800` + gasto → `"- $ 12.800"`. */
export function formatSignedAmount(value: number, kind: 'income' | 'expense'): string {
  return `${kind === 'income' ? '+' : '-'} ${formatAmount(value)}`;
}

/** `"2026-09-01"` → `"Septiembre 2026"`. */
export function formatMonth(iso: string): string {
  const date = parseIsoDate(iso);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** `"2026-09-15"` → `"15 sept."`. */
export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}
