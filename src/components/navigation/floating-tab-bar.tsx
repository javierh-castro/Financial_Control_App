import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TABS } from '@/components/navigation/tabs-config';
import { CardShadow, Colors, FontSize, Radius, Spacing, TabBarHeight } from '@/constants/theme';

/** Barra inferior flotante con forma de píldora, como en el diseño. */
export function FloatingTabBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, Spacing.four) }]}
      pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((item) => item.name === route.name);
          if (!tab) return null;

          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
              onPress={onPress}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={24}
                color={focused ? Colors.green : Colors.textSecondary}
              />
              <Text
                numberOfLines={1}
                style={[styles.label, focused ? styles.labelActive : undefined]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.four,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TabBarHeight,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    ...CardShadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.two,
  },
  label: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.green,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
