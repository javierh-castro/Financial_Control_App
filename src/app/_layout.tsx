import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DATABASE_NAME, migrateDbIfNeeded } from '@/data/db';
import { useSyncScheduler } from '@/hooks/use-sync-scheduler';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { AppThemeProvider, useAppTheme } from '@/providers/theme-provider';

const navigationFonts = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium: { fontFamily: 'System', fontWeight: '500' as const },
  bold: { fontFamily: 'System', fontWeight: '700' as const },
  heavy: { fontFamily: 'System', fontWeight: '800' as const },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <AppThemeProvider>
          <ThemedApp />
        </AppThemeProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

/** Traduce la paleta de `useAppTheme()` al tema de navegación (chrome del stack) y a la StatusBar. */
function ThemedApp() {
  const { isDark, colors } = useAppTheme();
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.green,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.background,
      notification: colors.red,
    },
    fonts: navigationFonts,
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Con sesión: solo el grupo (tabs). Sin sesión: solo el grupo (auth).
 * Ambos grupos están siempre declarados; `guard` decide cuál se puede
 * navegar, sin redirects manuales. Mientras se lee la sesión
 * persistida local no se muestra nada, para no parpadear entre grupos.
 */
function RootNavigator() {
  const { session, loading } = useAuth();
  // Dispara la sincronización con Supabase (login, foreground, reconexión);
  // sin lógica de red en las pantallas, ver src/services/sync-service.ts.
  useSyncScheduler();

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
