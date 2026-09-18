import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BalanceCard } from '@/components/home/balance-card';
import { GreetingHeader } from '@/components/home/greeting-header';
import { QuickActions } from '@/components/home/quick-actions';
import { TransactionList } from '@/components/home/transaction-list';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { availableBalance, currentSummary, recentTransactions } from '@/data/sample-data';

export default function HomeScreen() {
  return (
    <Screen>
      <GreetingHeader month={currentSummary.month} synced />

      <BalanceCard
        available={availableBalance(currentSummary)}
        income={currentSummary.income}
        expenses={currentSummary.expenses}
      />

      <QuickActions />

      <View style={styles.section}>
        <SectionHeader
          title="Últimos movimientos"
          actionLabel="Ver todos"
          onPressAction={() => router.navigate('/movimientos')}
        />
        <TransactionList transactions={recentTransactions} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.four,
  },
});
