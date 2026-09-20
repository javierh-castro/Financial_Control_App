import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BalanceGradient, Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/types/finance';

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Ícono opcional antes del texto, p. ej. "add-circle-outline" en "Guardar gasto". */
  icon?: IconName;
  /** Degradado a usar en vez del verde por default (p. ej. rojo en "Guardar gasto"). */
  gradient?: readonly [string, string, ...string[]];
};

/** Botón principal en pill con degradado verde; se repite en toda la app. */
export function PrimaryButton({ label, onPress, loading, disabled, icon, gradient }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [styles.wrapper, pressed && !isDisabled && styles.pressed]}>
      <LinearGradient
        colors={gradient ? [...gradient] : [...BalanceGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, isDisabled && styles.disabled]}>
        {loading ? (
          <ActivityIndicator color={Colors.textOnGreen} />
        ) : (
          <View style={styles.content}>
            {icon ? <Ionicons name={icon} size={20} color={Colors.textOnGreen} /> : null}
            <Text style={styles.label}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.85,
  },
  button: {
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.textOnGreen,
    letterSpacing: 0.5,
  },
});
