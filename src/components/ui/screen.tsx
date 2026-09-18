import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing, TabBarHeight } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** `false` para pantallas que manejan su propio scroll o que no scrollean. */
  scroll?: boolean;
};

/**
 * Contenedor común: fondo de la app, márgenes laterales, respeto del notch y
 * espacio inferior suficiente para que la barra flotante no tape el contenido.
 */
export function Screen({ children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const contentPadding = {
    paddingTop: insets.top + Spacing.four,
    paddingBottom: insets.bottom + TabBarHeight + Spacing.seven,
  };

  if (!scroll) {
    return (
      <View style={styles.root}>
        <View style={[styles.content, contentPadding]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, contentPadding]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
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
