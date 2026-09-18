import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  /** Texto de la acción a la derecha, por ejemplo "Ver todos". */
  actionLabel?: string;
  onPressAction?: () => void;
};

/** Título de sección con una acción opcional a la derecha. */
export function SectionHeader({ title, actionLabel, onPressAction }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPressAction}
          hitSlop={Spacing.two}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.green} />
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
    fontSize: FontSize.section,
    fontWeight: '800',
    color: Colors.text,
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
    color: Colors.green,
  },
  pressed: {
    opacity: 0.6,
  },
});
