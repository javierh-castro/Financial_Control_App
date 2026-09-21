import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardShadow, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { IconName } from '@/types/finance';

type Props = {
  onAddExpense?: () => void;
  onAddIncome?: () => void;
};

/** Los dos accesos rápidos para cargar un movimiento. */
export function QuickActions({ onAddExpense, onAddIncome }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <QuickAction
        label="Gasto"
        icon="remove"
        tint={colors.red}
        background={colors.redSoft}
        textColor={colors.text}
        onPress={onAddExpense}
      />
      <QuickAction
        label="Ingreso"
        icon="add"
        tint={colors.green}
        background={colors.greenSoft}
        textColor={colors.text}
        onPress={onAddIncome}
      />
    </View>
  );
}

function QuickAction({
  label,
  icon,
  tint,
  background,
  textColor,
  onPress,
}: {
  label: string;
  icon: IconName;
  tint: string;
  background: string;
  textColor: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Agregar ${label.toLowerCase()}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: background, borderColor: tint },
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={22} color={tint} />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    ...CardShadow,
  },
  label: {
    fontSize: FontSize.subtitle,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
