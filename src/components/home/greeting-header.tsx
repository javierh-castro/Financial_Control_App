import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
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
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.greeting} numberOfLines={1}>
          {name ? `Hola, ${name}` : 'Hola'} <Text style={styles.wave}>👋</Text>
        </Text>
        <Text style={styles.month}>{formatMonth(month)}</Text>
      </View>

      <View style={styles.chip}>
        <View style={[styles.dot, !synced && styles.dotOffline]} />
        <Text style={styles.chipLabel}>{synced ? 'Sincronizado' : 'Sin conexión'}</Text>
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
    fontSize: FontSize.display,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  wave: {
    fontSize: FontSize.section,
  },
  month: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: Colors.greenSoft,
    marginTop: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.green,
  },
  dotOffline: {
    backgroundColor: Colors.textSecondary,
  },
  chipLabel: {
    fontSize: FontSize.small,
    fontWeight: '600',
    color: Colors.text,
  },
});
