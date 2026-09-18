import { StyleSheet, Text, View } from 'react-native';

import { TransactionItem } from '@/components/home/transaction-item';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
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
  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyLabel}>{emptyLabel}</Text>
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  emptyLabel: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
