import { StyleSheet, Text } from 'react-native';

import { FontSize } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  text: string;
  tone?: 'error' | 'success';
};

/** Mensaje de error o confirmación bajo los campos de un formulario. */
export function FormMessage({ text, tone = 'error' }: Props) {
  const { colors } = useAppTheme();

  return (
    <Text style={[styles.base, { color: tone === 'error' ? colors.red : colors.green }]}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: FontSize.small,
    textAlign: 'center',
  },
});
