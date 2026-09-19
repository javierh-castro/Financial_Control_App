import { Link, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';

type Props = {
  prompt: string;
  actionLabel: string;
  href: Href;
};

/** "¿Ya tenés una cuenta? Iniciar sesión" y variantes. */
export function AuthFooterLink({ prompt, actionLabel, href }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{prompt} </Text>
      <Link href={href} style={styles.link}>
        {actionLabel}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  prompt: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: FontSize.small,
    color: Colors.green,
    fontWeight: '700',
  },
});
