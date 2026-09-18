import { ThemeProvider } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FloatingTabBar } from '@/components/navigation/floating-tab-bar';
import { TABS } from '@/components/navigation/tabs-config';
import { Colors } from '@/constants/theme';

/** Tema de navegación: la app usa una sola paleta clara en esta etapa. */
const navigationTheme = {
  dark: false,
  colors: {
    primary: Colors.green,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.background,
    notification: Colors.red,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="dark" />
        <Tabs
          screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Colors.background } }}
          tabBar={(props) => <FloatingTabBar {...props} />}>
          {TABS.map((tab) => (
            <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
          ))}
        </Tabs>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
