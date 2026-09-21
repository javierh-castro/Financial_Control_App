import { Link, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  prompt: string;
  actionLabel: string;
  href: Href;
};

/** "¿Ya tenés una cuenta? Iniciar sesión" y variantes. */
export function AuthFooterLink({ prompt, actionLabel, href }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.prompt, { color: colors.textSecondary }]}>{prompt} </Text>
      <Link href={href} style={[styles.link, { color: colors.green }]}>
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
  },
  link: {
    fontSize: FontSize.small,
    fontWeight: '700',
  },
});
