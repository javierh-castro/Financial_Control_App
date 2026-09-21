import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import { formatMonth } from '@/utils/format';

type Props = {
  name?: string;
  /** Mes que se está mirando, en ISO (YYYY-MM-DD). */
  month: string;
  /** Estado de sincronización; en esta etapa siempre llega como dato fijo. */
  synced?: boolean;
};

/** Saludo, mes en curso y chip de estado. */
export function GreetingHeader({ name, month, synced = true }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={[styles.greeting, { color: colors.text }]} numberOfLines={1}>
          {name ? `Hola, ${name}!` : 'Hola!'}
        </Text>
        <Text style={[styles.month, { color: colors.textSecondary }]}>{formatMonth(month)}</Text>
      </View>

      <View style={[styles.chip, { backgroundColor: colors.greenSoft }]}>
        <View style={[styles.dot, { backgroundColor: synced ? colors.green : colors.textSecondary }]} />
        <Text style={[styles.chipLabel, { color: colors.text }]}>
          {synced ? 'Sincronizado' : 'Sin conexión'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  texts: {
    flexShrink: 1,
    gap: Spacing.one,
  },
  greeting: {
    // Tamaño fijo, más chico que el token `display` (que comparte con el
    // monto grande de la tarjeta de saldo): el saludo baja 3 puntos más.
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  month: {
    // Tamaño fijo (no el token `body`): esta pantalla queda igual aunque
    // la escala general de fuentes se achique.
    fontSize: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    marginTop: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
  chipLabel: {
    fontSize: FontSize.small,
    fontWeight: '600',
  },
});
