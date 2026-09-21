import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TransactionList } from '@/components/home/transaction-list';
import { MovementsChart } from '@/components/movements/movements-chart';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Spacing } from '@/constants/theme';
import { useMovementsData } from '@/hooks/use-movements-data';

const RECENT_LIMIT = 5;

export default function MovimientosScreen() {
  const { granularity, setGranularity, currentBalance, points, transactions, loading } = useMovementsData();
  const [showAll, setShowAll] = useState(false);

  const hasMore = transactions.length > RECENT_LIMIT;
  const visibleTransactions = showAll ? transactions : transactions.slice(0, RECENT_LIMIT);

  return (
    <Screen>
      <MovementsChart
        granularity={granularity}
        onChangeGranularity={setGranularity}
        currentBalance={currentBalance}
        points={points}
        loading={loading}
      />

      <View style={styles.section}>
        <SectionHeader
          title="Movimientos recientes"
          actionLabel={hasMore ? (showAll ? 'Ver menos' : 'Ver todos') : undefined}
          onPressAction={() => setShowAll((value) => !value)}
        />
        <TransactionList
          transactions={visibleTransactions}
          emptyLabel={loading ? 'Cargando…' : 'No hay movimientos este mes.'}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.four,
  },
});
