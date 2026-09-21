import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  title: string;
  /** Texto de la acción a la derecha, por ejemplo "Ver todos". */
  actionLabel?: string;
  onPressAction?: () => void;
};

/** Título de sección con una acción opcional a la derecha. */
export function SectionHeader({ title, actionLabel, onPressAction }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          hitSlop={Spacing.two}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={[styles.actionLabel, { color: colors.green }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.green} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    flexShrink: 1,
    // Tamaño fijo, más chico que el token `section`: los títulos de
    // sección ("Últimos movimientos") bajan un poco más que el resto.
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actionLabel: {
    fontSize: FontSize.small,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
