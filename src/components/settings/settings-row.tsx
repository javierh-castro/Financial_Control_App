import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { IconCircle } from '@/components/ui/icon-circle';
import { FontSize, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { IconName } from '@/types/finance';

type Props = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress?: () => void;
  /** Fila sin funcionalidad todavía: se ve pero no reacciona al toque. */
  disabled?: boolean;
  /** Si se define (aunque sea `false`), la fila muestra un switch en vez de chevron. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  /** Ícono y texto en rojo, para acciones destructivas ("Eliminar cuenta"). */
  danger?: boolean;
};

/** Fila reutilizable de Ajustes: ícono + título/subtítulo + chevron o switch. */
export function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
  switchValue,
  onSwitchChange,
  danger,
}: Props) {
  const { colors } = useAppTheme();
  const isSwitchRow = switchValue !== undefined;
  const iconColor = danger ? colors.red : colors.textSecondary;
  const iconBackground = danger ? colors.redSoft : colors.background;
  const titleColor = danger ? colors.red : colors.text;

  const content = (
    <>
      <IconCircle name={icon} size={40} color={iconColor} backgroundColor={iconBackground} />
      <View style={styles.texts}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {disabled ? 'Próximamente' : subtitle}
        </Text>
      </View>
      {isSwitchRow ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.green }}
          thumbColor={colors.surface}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </>
  );

  if (isSwitchRow) {
    return <View style={[styles.row, disabled && styles.disabled]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [styles.row, pressed && !disabled && styles.pressed, disabled && styles.disabled]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSize.small,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
});
