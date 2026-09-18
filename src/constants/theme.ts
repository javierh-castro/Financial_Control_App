/**
 * Tokens de diseño de la app.
 *
 * La primera etapa usa una única paleta clara, que es la del diseño de
 * referencia del Home. Si más adelante se agrega modo oscuro, conviene
 * convertir `Colors` en `{ light, dark }` y leerlo con un hook de tema.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
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
  /** Texto principal. */
  text: '#0C1A12',
  /** Texto secundario: categorías, fechas, tabs inactivos. */
  textSecondary: '#8A93A6',
  /** Texto sobre el verde de la tarjeta de saldo. */
  textOnGreen: '#FFFFFF',
} as const;

/** Degradado de la tarjeta de saldo, de arriba a la izquierda hacia abajo. */
export const BalanceGradient = [Colors.greenLight, Colors.green] as const;

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
  caption: 12,
  small: 14,
  body: 16,
  subtitle: 18,
  section: 22,
  display: 34,
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
export const TabBarHeight = 64;
export const MaxContentWidth = 560;
