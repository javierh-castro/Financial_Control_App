import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

type Props = {
  onAddExpense?: () => void;
  onAddIncome?: () => void;
};

/** Los dos accesos rápidos para cargar un movimiento. */
export function QuickActions({ onAddExpense, onAddIncome }: Props) {
  return (
    <View style={styles.row}>
      <QuickAction
        label="Gasto"
        tint={Colors.red}
        background={Colors.redSoft}
        onPress={onAddExpense}
      />
      <QuickAction
        label="Ingreso"
        tint={Colors.green}
        background={Colors.greenSoft}
        onPress={onAddIncome}
      />
    </View>
  );
}

function QuickAction({
  label,
  tint,
  background,
  onPress,
}: {
  label: string;
  tint: string;
  background: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Agregar ${label.toLowerCase()}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: background },
        pressed && styles.pressed,
      ]}>
      <View style={styles.icon}>
        <Ionicons name="add" size={22} color={tint} />
      </View>
      <Text style={styles.label}>{label}</Text>
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
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  label: {
    fontSize: FontSize.subtitle,
    fontWeight: '800',
    color: Colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
