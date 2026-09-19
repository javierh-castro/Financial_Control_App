import { StyleSheet, Text, View } from 'react-native';

import { IconCircle } from '@/components/ui/icon-circle';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import type { IconName } from '@/types/finance';

type Props = {
  icon: IconName;
  title: string;
  subtitle: string;
};

/** Ícono + título + bajada, igual en las tres pantallas de auth. */
export function AuthHeader({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <IconCircle name={icon} size={88} color={Colors.green} backgroundColor={Colors.greenSofter} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
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
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
