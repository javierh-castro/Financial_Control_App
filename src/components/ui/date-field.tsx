import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  accentColor: string;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Campo de fecha sobre `@expo/ui`'s `DateTimePicker`. En iOS es un
 * control compacto nativo siempre visible (se abre solo al tocarlo). En
 * Android, `presentation="dialog"` dispara el diálogo apenas se monta,
 * así que acá se monta recién cuando el usuario toca la fila propia, y
 * se desmonta al confirmar/cancelar.
 */
export function DateField({ value, onChange, accentColor }: Props) {
  const { colors, isDark } = useAppTheme();
  const [androidPickerOpen, setAndroidPickerOpen] = useState(false);

  if (Platform.OS === 'android') {
    return (
      <>
        <Pressable
          accessibilityRole="button"
          onPress={() => setAndroidPickerOpen(true)}
          style={({ pressed }) => [
            styles.field,
            { backgroundColor: colors.background },
            pressed && styles.pressed,
          ]}>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.value, { color: colors.text }]}>{formatDate(value)}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
        {androidPickerOpen && (
          <DateTimePicker
            value={value}
            mode="date"
            presentation="dialog"
            accentColor={accentColor}
            onValueChange={(_event, date) => {
              setAndroidPickerOpen(false);
              onChange(date);
            }}
            onDismiss={() => setAndroidPickerOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <View style={[styles.field, { backgroundColor: colors.background }]}>
      <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
      <DateTimePicker
        value={value}
        mode="date"
        display="compact"
        accentColor={accentColor}
        themeVariant={isDark ? 'dark' : 'light'}
        onValueChange={(_event, date) => onChange(date)}
        style={styles.picker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    height: 56,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.lg,
  },
  picker: {
    flex: 1,
  },
  value: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
