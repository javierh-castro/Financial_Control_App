import type { IconName } from '@/types/finance';

export type TabConfig = {
  /** Nombre del archivo de ruta dentro de `src/app`. */
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
};

/** Orden y contenido de la barra inferior. */
export const TABS: TabConfig[] = [
  { name: 'index', label: 'Inicio', icon: 'home-outline', iconActive: 'home' },
  {
    name: 'movimientos',
    label: 'Movimientos',
    icon: 'document-text-outline',
    iconActive: 'document-text',
  },
  { name: 'analisis', label: 'Análisis', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  { name: 'ajustes', label: 'Ajustes', icon: 'person-outline', iconActive: 'person' },
];
