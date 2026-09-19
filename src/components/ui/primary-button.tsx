import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { BalanceGradient, Colors, FontSize, Radius } from '@/constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
};

/** Botón principal en pill con degradado verde; se repite en toda la app. */
export function PrimaryButton({ label, onPress, loading, disabled }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [styles.wrapper, pressed && !isDisabled && styles.pressed]}>
      <LinearGradient
        colors={[...BalanceGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, isDisabled && styles.disabled]}>
        {loading ? (
          <ActivityIndicator color={Colors.textOnGreen} />
        ) : (
          <Text style={styles.label}>{label}</Text>
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
  label: {
    fontSize: FontSize.body,
    fontWeight: '800',
    color: Colors.textOnGreen,
    letterSpacing: 0.5,
  },
});
