import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BalanceCard } from '@/components/home/balance-card';
import { GreetingHeader } from '@/components/home/greeting-header';
import { QuickActions } from '@/components/home/quick-actions';
import { TransactionList } from '@/components/home/transaction-list';
import { AddTransactionSheet } from '@/components/transactions/add-transaction-sheet';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { availableBalance } from '@/data/transactions';
import { useHomeData } from '@/hooks/use-home-data';
import type { TransactionKind } from '@/types/finance';

export default function HomeScreen() {
  const { summary, transactions, loading, reload } = useHomeData();
  const [sheetKind, setSheetKind] = useState<TransactionKind | null>(null);

  return (
    <Screen>
      <GreetingHeader month={summary.month} synced />

      <BalanceCard
        available={availableBalance(summary)}
        income={summary.income}
        expenses={summary.expenses}
      />

      <QuickActions
        onAddExpense={() => setSheetKind('expense')}
        onAddIncome={() => setSheetKind('income')}
      />

      <View style={styles.section}>
        <SectionHeader
          title="Últimos movimientos"
          actionLabel="Ver todos"
          onPressAction={() => router.navigate('/movimientos')}
        />
        <TransactionList
          transactions={transactions}
          emptyLabel={loading ? 'Cargando…' : undefined}
        />
      </View>

      <AddTransactionSheet
        kind={sheetKind ?? 'expense'}
        isPresented={sheetKind !== null}
        onDismiss={() => setSheetKind(null)}
        onSaved={reload}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.four,
  },
});
