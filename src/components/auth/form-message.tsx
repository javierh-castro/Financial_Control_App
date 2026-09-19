import { StyleSheet, Text } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';

type Props = {
  text: string;
  tone?: 'error' | 'success';
};

/** Mensaje de error o confirmación bajo los campos de un formulario. */
export function FormMessage({ text, tone = 'error' }: Props) {
  return <Text style={[styles.base, tone === 'error' ? styles.error : styles.success]}>{text}</Text>;
}

const styles = StyleSheet.create({
  base: {
    fontSize: FontSize.small,
    textAlign: 'center',
  },
  error: {
    color: Colors.red,
  },
  success: {
    color: Colors.green,
  },
});
