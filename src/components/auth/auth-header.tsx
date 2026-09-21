import { StyleSheet, Text, View } from 'react-native';

import { IconCircle } from '@/components/ui/icon-circle';
import { FontSize, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { IconName } from '@/types/finance';

type Props = {
  icon: IconName;
  title: string;
  subtitle: string;
};

/** Ícono + título + bajada, igual en las tres pantallas de auth. */
export function AuthHeader({ icon, title, subtitle }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <IconCircle name={icon} size={88} color={colors.green} backgroundColor={colors.greenSofter} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSize.section,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.small,
    textAlign: 'center',
  },
});
