import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconCircle } from '@/components/ui/icon-circle';
import { CardShadow, FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { Transaction } from '@/types/finance';
import { formatShortDate, formatSignedAmount } from '@/utils/format';

type Props = {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
};

/** Una fila de la lista de movimientos. */
export function TransactionItem({ transaction, onPress }: Props) {
  const { colors } = useAppTheme();
  const isIncome = transaction.kind === 'income';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(transaction)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}>
      <IconCircle name={transaction.icon} color={colors.text} backgroundColor={colors.greenSofter} />

      <View style={styles.texts}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
          {transaction.category}
        </Text>
      </View>

      <View style={styles.amounts}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatShortDate(transaction.date)}
        </Text>
        <Text style={[styles.amount, { color: isIncome ? colors.green : colors.red }]}>
          {formatSignedAmount(transaction.amount, transaction.kind)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    ...CardShadow,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    // Sin negrita: alcanza con que sea más oscuro que `category` para
    // distinguirse como el texto principal de la fila.
    fontSize: FontSize.body,
  },
  category: {
    fontSize: FontSize.small,
  },
  amounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  date: {
    fontSize: FontSize.caption,
  },
  amount: {
    fontSize: FontSize.body,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
