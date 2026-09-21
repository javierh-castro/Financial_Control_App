import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BalanceGradient, CardShadow, Colors, Radius, Spacing } from '@/constants/theme';
import type { IconName } from '@/types/finance';
import { formatAmount, maskAmount } from '@/utils/format';

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
      <View style={styles.balanceBlock}>
        <Text style={styles.label}>Disponible</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
            {hidden ? maskAmount(available) : formatAmount(available)}
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
        <Ionicons name={icon} size={18} color={Colors.textOnGreen} />
      </View>
      <View style={styles.statTexts}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {hidden ? maskAmount(value) : formatAmount(value)}
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
  balanceBlock: {
    gap: Spacing.one,
  },
  label: {
    // Tamaño fijo (no el token `body`): esta tarjeta queda igual aunque
    // la escala general de fuentes se achique.
    fontSize: 16,
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
    // Tamaño fijo (ya no el token `display`, que ahora usa el saludo con
    // otro valor): este monto queda como estaba.
    fontSize: 31,
    fontWeight: '800',
    color: Colors.textOnGreen,
    letterSpacing: -1,
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
    gap: Spacing.two,
  },
  statIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTexts: {
    flex: 1,
  },
  statLabel: {
    // Tamaños fijos (no los tokens `caption`/`subtitle`): esta tarjeta
    // queda igual aunque la escala general de fuentes se achique.
    fontSize: 12,
    color: Colors.textOnGreen,
    opacity: 0.9,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textOnGreen,
  },
  pressed: {
    opacity: 0.6,
  },
});
