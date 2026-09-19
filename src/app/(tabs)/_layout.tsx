import { Tabs } from 'expo-router/js-tabs';

import { FloatingTabBar } from '@/components/navigation/floating-tab-bar';
import { TABS } from '@/components/navigation/tabs-config';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Colors.background } }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}
