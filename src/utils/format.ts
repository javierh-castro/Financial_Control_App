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

/** Abreviatura de 3 letras sin punto, para etiquetas cortas del eje ("Oct", "Dic", "Ene"). */
const MONTHS_ABBR = MONTHS.map((name) => name.slice(0, 3));

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

/** `104600` → `"$ •••.•••"`. Mismo largo que `formatAmount`, para que ocultar el saldo no mueva el layout. */
export function maskAmount(value: number): string {
  return formatAmount(value).replace(/\d/g, '•');
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

/** `"2026-09-15"` → `"15 sept. 2026"`. Para rangos que pueden cruzar años. */
export function formatDateWithYear(iso: string): string {
  const date = parseIsoDate(iso);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** `"2026-09-15"` → `"Mar"` (día de la semana, abreviado a 3 letras). */
export function formatWeekdayShort(iso: string): string {
  const date = parseIsoDate(iso);
  return WEEKDAYS_SHORT[date.getDay()];
}

/** `"2026-10-01"` → `"Oct"` (mes, abreviado a 3 letras, sin punto). */
export function formatMonthAbbr(iso: string): string {
  const date = parseIsoDate(iso);
  return MONTHS_ABBR[date.getMonth()];
}

/** `"Javier Castro"` → `"Javier"`. `undefined` si no hay nombre cargado. */
export function firstName(fullName?: string | null): string | undefined {
  const trimmed = fullName?.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : undefined;
}
