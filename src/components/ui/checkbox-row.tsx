import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  checked: boolean;
  onToggle: () => void;
  label: string;
};

/** Checkbox con etiqueta; hoy solo lo usa "aceptar términos" del registro. */
export function CheckboxRow({ checked, onToggle, label }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={styles.row}>
      <View
        style={[
          styles.box,
          { borderColor: colors.textSecondary },
          checked && { backgroundColor: colors.green, borderColor: colors.green },
        ]}>
        {checked && <Ionicons name="checkmark" size={16} color={colors.textOnGreen} />}
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: FontSize.small,
  },
});
