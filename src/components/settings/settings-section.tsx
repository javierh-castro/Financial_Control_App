import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CardShadow, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  title: string;
  children: ReactNode;
};

/** Tarjeta con título de sección y filas de `SettingsRow` separadas por línea. */
export function SettingsSection({ title, children }: Props) {
  const { colors } = useAppTheme();
  const rows = Children.toArray(children);

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {row}
            {index < rows.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSize.small,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: Spacing.one,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...CardShadow,
    shadowOpacity: 0.05,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    // Alinea con el texto, no con el ícono circular de 40 a la izquierda.
    marginLeft: Spacing.four + 40 + Spacing.three,
  },
});
