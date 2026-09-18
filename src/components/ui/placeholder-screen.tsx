import { StyleSheet, Text, View } from 'react-native';

import { IconCircle } from '@/components/ui/icon-circle';
import { Screen } from '@/components/ui/screen';
import { Colors, FontSize, Spacing } from '@/constants/theme';
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
  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <IconCircle
          name={icon}
          size={72}
          color={Colors.green}
          backgroundColor={Colors.greenSofter}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
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
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
