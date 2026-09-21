import { StyleSheet, Text, View } from 'react-native';

import { IconCircle } from '@/components/ui/icon-circle';
import { Screen } from '@/components/ui/screen';
import { FontSize, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { IconName } from '@/types/finance';

type Props = {
  icon: IconName;
  title: string;
  description: string;
};

/**
 * Pantalla de las secciones que todavía no se implementaron. Existe para que
 * la navegación inferior funcione completa desde la primera etapa.
 */
export function PlaceholderScreen({ icon, title, description }: Props) {
  const { colors } = useAppTheme();

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <IconCircle name={icon} size={72} color={colors.green} backgroundColor={colors.greenSofter} />
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  title: {
    fontSize: FontSize.section,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.body,
    textAlign: 'center',
    maxWidth: 280,
  },
});
