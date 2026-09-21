import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TABS } from '@/components/navigation/tabs-config';
import { CardShadow, FontSize, MaxContentWidth, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

/** Barra inferior flotante con forma de píldora, como en el diseño. */
export function FloatingTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom * 0.4, Spacing.two) }]}
      pointerEvents="box-none">
      <View style={styles.barContainer}>
        <View style={[styles.bar, { backgroundColor: colors.surface }]}>
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
                  size={28}
                  color={focused ? colors.green : colors.textSecondary}
                />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    { color: focused ? colors.green : colors.textSecondary },
                    focused && styles.labelActive,
                  ]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
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
    paddingHorizontal: Spacing.three,
    backgroundColor: 'transparent',
  },
  barContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TabBarHeight,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.lg,
    ...CardShadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.three,
  },
  label: {
    fontSize: FontSize.small,
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
