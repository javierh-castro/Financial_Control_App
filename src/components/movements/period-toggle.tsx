import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { MovementsGranularity } from '@/hooks/use-movements-data';

type Props = {
  value: MovementsGranularity;
  onChange: (value: MovementsGranularity) => void;
};

const OPTIONS: { value: MovementsGranularity; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
];

/** Selector Día/Mes/Año de la granularidad del gráfico de movimientos. */
export function PeriodToggle({ value, onChange }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.background }]}>
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && { backgroundColor: colors.blueSoft }]}>
            <Text style={[styles.label, { color: active ? colors.blue : colors.textSecondary }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: Spacing.one,
    padding: Spacing.one,
    borderRadius: Radius.pill,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  label: {
    fontSize: FontSize.caption,
    fontWeight: '700',
  },
});
