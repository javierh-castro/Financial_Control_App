import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { DarkColors, LightColors, type ColorPalette } from '@/constants/theme';

const DARK_MODE_STORAGE_KEY = 'settings.dark_mode_enabled';

type ThemeContextValue = {
  isDark: boolean;
  colors: ColorPalette;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * `localStorage` ya queda instalado en `@/lib/supabase` (síncrono, sobre
 * SQLite vía `expo-sqlite/localStorage/install`), así que la preferencia
 * de tema se lee de entrada sin esperar ninguna promesa: la primera
 * pintada ya usa el modo correcto, sin parpadeo claro→oscuro.
 */
function readStoredPreference(): boolean {
  try {
    return localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Modo oscuro: preferencia de este dispositivo (no sincroniza entre
 * dispositivos con Supabase, como sí lo hacen `notifications_enabled` en
 * `user_preferences`). Hoy solo la usan los componentes de Ajustes, que
 * leen la paleta de `useAppTheme()` en vez de `Colors` fijo.
 */
export function AppThemeProvider({ children }: PropsWithChildren) {
  const [isDark, setIsDark] = useState(readStoredPreference);

  function setDarkMode(value: boolean) {
    setIsDark(value);
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, value ? 'true' : 'false');
    } catch {
      // Si falla la escritura, la preferencia queda solo en memoria por esta sesión.
    }
  }

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? DarkColors : LightColors, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useAppTheme debe usarse dentro de <AppThemeProvider>');
  }
  return value;
}
