import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { IconName } from '@/types/finance';

import { IconCircle } from './icon-circle';

type Props = {
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  value: string;
  onPress: () => void;
  /** Si el selector abre un acordeón propio, invierte el chevron para marcarlo abierto. */
  expanded?: boolean;
};

/**
 * Fila con la pinta de un `TextField`, pero que abre un selector propio
 * al tocarla en vez de aceptar texto (categoría, método de pago).
 */
export function SelectField({ icon, iconColor, iconBackground, value, onPress, expanded }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: !!expanded }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.field,
        { backgroundColor: colors.background },
        pressed && styles.pressed,
      ]}>
      <IconCircle name={icon} size={32} color={iconColor} backgroundColor={iconBackground} />
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    height: 56,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.lg,
  },
  value: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
