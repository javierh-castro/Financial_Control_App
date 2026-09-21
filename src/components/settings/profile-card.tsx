import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardShadow, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  name?: string;
  email?: string;
  onPress: () => void;
};

/** Tarjeta superior de Ajustes: iniciales, apodo y email; toca para editar el apodo. */
export function ProfileCard({ name, email, onPress }: Props) {
  const { colors } = useAppTheme();
  const initial = (name?.trim()?.[0] ?? email?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Editar apodo"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.avatar, { backgroundColor: colors.greenSoft }]}>
        <Text style={[styles.initial, { color: colors.green }]}>{initial}</Text>
      </View>
      <View style={styles.texts}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name ?? 'Sin apodo'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
          {email}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    ...CardShadow,
    shadowOpacity: 0.05,
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: FontSize.section,
    fontWeight: '800',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.subtitle,
    fontWeight: '800',
  },
  email: {
    fontSize: FontSize.small,
  },
});
