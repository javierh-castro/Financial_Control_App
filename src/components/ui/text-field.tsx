import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/types/finance';

type Props = TextInputProps & {
  icon: IconName;
  /** Muestra el ícono de ojo para alternar mostrar/ocultar el valor. */
  secureToggle?: boolean;
};

/** Campo de texto con ícono a la izquierda; lo usan las pantallas de auth. */
export function TextField({ icon, secureToggle, secureTextEntry, style, ...inputProps }: Props) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry={secureToggle ? hidden : secureTextEntry}
        {...inputProps}
      />
      {secureToggle && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          onPress={() => setHidden((value) => !value)}
          hitSlop={Spacing.three}>
          <Ionicons
            name={hidden ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={Colors.textSecondary}
          />
        </Pressable>
      )}
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
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.text,
  },
});
