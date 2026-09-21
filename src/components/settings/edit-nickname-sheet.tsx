import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { FontSize, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  isPresented: boolean;
  initialValue?: string;
  saving: boolean;
  error: string | null;
  onDismiss: () => void;
  onSave: (nickname: string) => void;
};

/** Hoja para editar el apodo, sobre `BottomSheet`/`TextField` (ya theming-aware). */
export function EditNicknameSheet({
  isPresented,
  initialValue,
  saving,
  error,
  onDismiss,
  onSave,
}: Props) {
  const { colors } = useAppTheme();
  const [value, setValue] = useState(initialValue ?? '');
  // Patrón de "ajustar estado en base a un cambio de prop" (sin efecto),
  // igual que `BottomSheet`: al volver a abrirse, el campo arranca de
  // nuevo desde el apodo actual en vez de lo que haya quedado tipeado.
  const [prevPresented, setPrevPresented] = useState(isPresented);
  if (isPresented !== prevPresented) {
    setPrevPresented(isPresented);
    if (isPresented) {
      setValue(initialValue ?? '');
    }
  }

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Editar apodo</Text>
        <TextField
          icon="person-outline"
          placeholder="Tu nombre"
          value={value}
          onChangeText={setValue}
          autoFocus
          maxLength={40}
        />
        {error ? <Text style={[styles.error, { color: colors.red }]}>{error}</Text> : null}
        <PrimaryButton
          label="Guardar"
          onPress={() => onSave(value.trim())}
          loading={saving}
          disabled={!value.trim()}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  title: {
    fontSize: FontSize.section,
    fontWeight: '800',
  },
  error: {
    fontSize: FontSize.small,
    marginTop: -Spacing.two,
  },
});
