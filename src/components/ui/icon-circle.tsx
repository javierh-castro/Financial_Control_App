import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
      <Ionicons name={name} size={Math.round(size * 0.48)} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
