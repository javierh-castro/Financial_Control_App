import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/types/finance';

import { IconCircle } from './icon-circle';

type Props = {
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  value: string;
  onPress: () => void;
};

/**
 * Fila con la pinta de un `TextField`, pero que abre un selector propio
 * al tocarla en vez de aceptar texto (categoría, método de pago).
 */
export function SelectField({ icon, iconColor, iconBackground, value, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && styles.pressed]}>
      <IconCircle name={icon} size={32} color={iconColor} backgroundColor={iconBackground} />
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
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
    backgroundColor: Colors.background,
  },
  value: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
