import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, TabBarHeight } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  children: ReactNode;
  /** `false` para pantallas que manejan su propio scroll o que no scrollean. */
  scroll?: boolean;
};

/**
 * Contenedor común: fondo de la app (según el tema activo), márgenes
 * laterales, respeto del notch y espacio inferior suficiente para que la
 * barra flotante no tape el contenido.
 */
export function Screen({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const rootStyle = { backgroundColor: colors.background };
  const contentPadding = {
    paddingTop: insets.top + Spacing.four,
    paddingBottom: insets.bottom + TabBarHeight + Spacing.seven,
  };

  if (!scroll) {
    return (
      <View style={[styles.root, rootStyle]}>
        <View style={[styles.content, contentPadding]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, rootStyle]}
      contentContainerStyle={[styles.content, contentPadding]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.six,
  },
});
