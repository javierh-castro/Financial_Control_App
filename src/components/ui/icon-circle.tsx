import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { MoneyBillWaveIcon } from '@/components/ui/money-bill-wave-icon';
import { Radius } from '@/constants/theme';
import type { IconName } from '@/types/finance';

type Props = {
  name: IconName;
  /** Diámetro del círculo. */
  size?: number;
  color: string;
  backgroundColor: string;
  style?: StyleProp<ViewStyle>;
};

/** Ícono dentro de un círculo de color: se repite en toda la app. */
export function IconCircle({ name, size = 44, color, backgroundColor, style }: Props) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: Radius.pill, backgroundColor },
        style,
      ]}>
      {name === 'briefcase-outline' ? (
        <MoneyBillWaveIcon size={Math.round(size * 0.48)} color={color} />
      ) : (
        <Ionicons name={name} size={Math.round(size * 0.48)} color={color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
