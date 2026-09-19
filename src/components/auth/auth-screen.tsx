import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardShadow, Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

/**
 * Fondo degradado + tarjeta blanca centrada: la base común de
 * login/registro/recuperar contraseña. No usa `Screen` (ese reserva
 * espacio para la barra de tabs, que acá no existe).
 */
export function AuthScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={[Colors.surface, Colors.background]} style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.six },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
  },
  card: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.five,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.six,
    ...CardShadow,
  },
});
