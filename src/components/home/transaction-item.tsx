import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconCircle } from '@/components/ui/icon-circle';
import { CardShadow, Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import type { Transaction } from '@/types/finance';
import { formatShortDate, formatSignedAmount } from '@/utils/format';

type Props = {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
};

/** Una fila de la lista de movimientos. */
export function TransactionItem({ transaction, onPress }: Props) {
  const isIncome = transaction.kind === 'income';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(transaction)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <IconCircle
        name={transaction.icon}
        color={Colors.text}
        backgroundColor={Colors.greenSofter}
      />

      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.title}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {transaction.category}
        </Text>
      </View>

      <View style={styles.amounts}>
        <Text style={styles.date}>{formatShortDate(transaction.date)}</Text>
        <Text style={[styles.amount, { color: isIncome ? Colors.green : Colors.red }]}>
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
    backgroundColor: Colors.surface,
    ...CardShadow,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.text,
  },
  category: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
  },
  amounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  date: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  amount: {
    fontSize: FontSize.body,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});
