/**
 * Tokens de diseño de la app.
 *
 * La mayoría de las pantallas (Home, Movimientos, Análisis) todavía usan
 * `Colors` como paleta clara fija. Ajustes es la primera en sumar modo
 * oscuro de verdad: sus componentes leen la paleta de `useAppTheme()`
 * (ver `@/providers/theme-provider`) en vez de importar `Colors` directo.
 * Extender el resto de la app implica el mismo cambio ahí.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const LightColors = {
  /** Fondo general de las pantallas: hueso con un toque verde. */
  background: '#F2F6F3',
  /** Tarjetas y barra de navegación. */
  surface: '#FFFFFF',
  /** Verde principal (botones, montos positivos, tab activo). */
  green: '#12B76A',
  /** Verde claro del degradado de la tarjeta de saldo. */
  greenLight: '#3FD98C',
  /** Fondo de chips y botones verdes suaves. */
  greenSoft: '#D6F3E2',
  /** Fondo de los íconos circulares de la lista de movimientos. */
  greenSofter: '#E4F6EC',
  /** Rojo de los gastos. */
  red: '#F4594E',
  /** Fondo del acceso rápido "Gasto". */
  redSoft: '#FBE2E0',
  /** Azul del saldo en el gráfico de movimientos. */
  blue: '#2F6FEE',
  /** Fondo de los chips/segmentos activos relacionados al saldo. */
  blueSoft: '#DCE7FC',
  /** Ingresos en el gráfico de movimientos (distinto del verde general de la app). */
  chartIncome: '#08B978',
  /** Egresos en el gráfico de movimientos (distinto del rojo general de la app). */
  chartExpense: '#EE7075',
  /** Texto principal. */
  text: '#0C1A12',
  /** Texto secundario: categorías, fechas, tabs inactivos. */
  textSecondary: '#8A93A6',
  /** Texto sobre el verde de la tarjeta de saldo (y sobre superficies oscuras en modo oscuro). */
  textOnGreen: '#FFFFFF',
  /** Línea divisoria sutil entre filas de una misma tarjeta. */
  border: '#EDF1EE',
} as const;

export type ColorPalette = { [K in keyof typeof LightColors]: string };

/** Misma semántica que `LightColors`, valores ajustados para fondo oscuro. */
export const DarkColors: ColorPalette = {
  background: '#0B120E',
  surface: '#151D18',
  green: '#1ED88A',
  greenLight: '#3FD98C',
  greenSoft: '#173627',
  greenSofter: '#132A1F',
  red: '#FF7A70',
  redSoft: '#3A1C1A',
  blue: '#6D9BFF',
  blueSoft: '#16233D',
  chartIncome: '#2FD998',
  chartExpense: '#FF8B8F',
  text: '#EAF3EC',
  textSecondary: '#93A29A',
  textOnGreen: '#0C1A12',
  border: '#22302A',
};

/** Alias de compatibilidad: el código que todavía no usa `useAppTheme()` sigue viendo la paleta clara. */
export const Colors = LightColors;

/** Degradado de la tarjeta de saldo, de arriba a la izquierda hacia abajo. */
export const BalanceGradient = [LightColors.greenLight, LightColors.green] as const;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
} as const;

export const Radius = {
  sm: 14,
  md: 20,
  lg: 26,
  pill: 999,
} as const;

export const FontSize = {
  caption: 10,
  small: 12,
  body: 14,
  subtitle: 16,
  section: 20,
  display: 31,
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

/** Sombra suave y difusa, la de las tarjetas del diseño. */
export const CardShadow = {
  shadowColor: '#0C1A12',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

/** Alto de la barra flotante; el Home lo usa para no tapar contenido. */
export const TabBarHeight = 76;
export const MaxContentWidth = 560;
