import { StyleSheet, Text, View } from 'react-native';

import { TransactionItem } from '@/components/home/transaction-item';
import { FontSize, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { Transaction } from '@/types/finance';

type Props = {
  transactions: Transaction[];
  onPressTransaction?: (transaction: Transaction) => void;
  emptyLabel?: string;
};

/**
 * Lista de movimientos. Va dentro del scroll de la pantalla, así que apila
 * las filas en lugar de usar su propia FlatList.
 */
export function TransactionList({
  transactions,
  onPressTransaction,
  emptyLabel = 'Todavía no cargaste movimientos.',
}: Props) {
  const { colors } = useAppTheme();

  if (transactions.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyLabel, { color: colors.textSecondary }]}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onPress={onPressTransaction}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  empty: {
    padding: Spacing.five,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  emptyLabel: {
    fontSize: FontSize.small,
    textAlign: 'center',
  },
});
