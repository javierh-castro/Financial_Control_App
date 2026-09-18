import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BalanceGradient, CardShadow, Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/types/finance';
import { formatAmount } from '@/utils/format';

type Props = {
  available: number;
  income: number;
  expenses: number;
};

/** Tarjeta verde con el saldo disponible y el corte de ingresos/gastos. */
export function BalanceCard({ available, income, expenses }: Props) {
  const [hidden, setHidden] = useState(false);

  return (
    <LinearGradient
      colors={[...BalanceGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.balanceBlock}>
          <Text style={styles.label}>Disponible</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
              {hidden ? '$ ••••••' : formatAmount(available)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
              onPress={() => setHidden((value) => !value)}
              hitSlop={Spacing.three}
              style={({ pressed }) => pressed && styles.pressed}>
              <Ionicons
                name={hidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textOnGreen}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.badge}>
          <MaterialCommunityIcons name="cash-multiple" size={30} color={Colors.textOnGreen} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <Stat icon="arrow-down" label="Ingresos" value={income} hidden={hidden} />
        <View style={styles.statsDivider} />
        <Stat icon="arrow-up" label="Gastos" value={expenses} hidden={hidden} />
      </View>
    </LinearGradient>
  );
}

function Stat({
  icon,
  label,
  value,
  hidden,
}: {
  icon: IconName;
  label: string;
  value: number;
  hidden: boolean;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={18} color={Colors.green} />
      </View>
      <View style={styles.statTexts}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {hidden ? '$ ••••' : formatAmount(value)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.five,
    gap: Spacing.four,
    ...CardShadow,
    shadowColor: Colors.green,
    shadowOpacity: 0.28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  balanceBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  label: {
    fontSize: FontSize.body,
    color: Colors.textOnGreen,
    opacity: 0.9,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  amount: {
    flexShrink: 1,
    fontSize: FontSize.display,
    fontWeight: '800',
    color: Colors.textOnGreen,
    letterSpacing: -1,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.three,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  statTexts: {
    flex: 1,
  },
  statLabel: {
    fontSize: FontSize.caption,
    color: Colors.textOnGreen,
    opacity: 0.9,
  },
  statValue: {
    fontSize: FontSize.subtitle,
    fontWeight: '700',
    color: Colors.textOnGreen,
  },
  pressed: {
    opacity: 0.6,
  },
});
