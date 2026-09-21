import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { BarChart, type barDataItem } from 'react-native-gifted-charts';

import { IconCircle } from '@/components/ui/icon-circle';
import { PeriodToggle } from '@/components/movements/period-toggle';
import { CardShadow, FontSize, Radius, Spacing, type ColorPalette } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';
import type { MovementsGranularity } from '@/hooks/use-movements-data';
import { formatAmount, formatSignedAmount } from '@/utils/format';
import { movementsAxisRange, type MovementsPoint } from '@/utils/movements-series';

/**
 * Gráfico de "Tus movimientos", aislado en un solo componente para poder
 * cambiar de librería de gráficos en el futuro sin tocar el resto de la
 * app. Hoy usa `react-native-gifted-charts`; nada fuera de este archivo
 * conoce esa dependencia. No hace ninguna consulta ni cálculo de datos:
 * todo eso vive en `data/movements-analytics.ts` y `utils/movements-series.ts`.
 *
 * Diseño: dos barras verticales por período (ingresos y gastos), ambas
 * creciendo desde 0, sin línea de saldo ni eje negativo. El ancho de
 * barra y el espacio interno del par son fijos en los tres modos; lo que
 * cambia es el espacio ENTRE grupos, calculado a mano para que los
 * grupos se repartan parejo en todo el ancho disponible (nunca se deja
 * en manos de `adjustToWidth`, que no respetaría ese ancho fijo).
 */

type Props = {
  granularity: MovementsGranularity;
  onChangeGranularity: (granularity: MovementsGranularity) => void;
  currentBalance: number;
  points: MovementsPoint[];
  loading: boolean;
};

const GROUP_BAR_WIDTH = 12;
/** Distancia interna entre la barra verde y la roja de un mismo grupo, igual en los tres modos. */
const GROUP_INNER_SPACING = 6;
/** Espacio entre la tarjeta y el primer/último grupo. */
const CHART_EDGE_SPACING = 10;
const MIN_GROUP_GAP = 4;

const Y_AXIS_LABEL_WIDTH = 38;
/** Alto de cada una de las 7 secciones del eje (más la línea de cero, dan las 8 líneas pedidas). */
const AXIS_SECTION_HEIGHT = 24;
const LABELS_HEIGHT = 20;
/**
 * Las etiquetas de "Año" dicen cosas como "Oct–Nov": mucho más anchas
 * que "Sem 1" o un número de día, así que necesitan su propia caja de
 * texto (no la del par de barras, que es angosta) para no truncarse.
 */
const YEAR_LABEL_WIDTH = 72;
const ANIMATION_DURATION = 350;

type GroupLayout = {
  barWidth: number;
  innerSpacing: number;
  groupGap: number;
  edgeSpacing: number;
};

/**
 * Ancho de barra y espacio interno fijos; el espacio ENTRE grupos sale
 * de repartir lo que sobra del ancho medido por `onLayout` en partes
 * iguales, para que los grupos ocupen todo el ancho disponible sin
 * amontonarse (el bug que se ve cuando hay pocos grupos, p. ej. 4 en
 * "Mes", y se deja el auto-ajuste de la librería).
 */
function computeGroupLayout(containerWidth: number, groupCount: number): GroupLayout {
  const plotWidth = containerWidth - Y_AXIS_LABEL_WIDTH;
  const pairWidth = GROUP_BAR_WIDTH * 2 + GROUP_INNER_SPACING;
  const gapCount = Math.max(1, groupCount - 1);
  const rawGap = (plotWidth - CHART_EDGE_SPACING * 2 - pairWidth * groupCount) / gapCount;
  const groupGap = Number.isFinite(rawGap) ? Math.max(MIN_GROUP_GAP, rawGap) : MIN_GROUP_GAP;
  return { barWidth: GROUP_BAR_WIDTH, innerSpacing: GROUP_INNER_SPACING, groupGap, edgeSpacing: CHART_EDGE_SPACING };
}

type TouchZone = { left: number; width: number };

/**
 * Una zona táctil por grupo, mucho más ancha que las barras finas: cubre
 * desde el punto medio con el grupo anterior hasta el punto medio con el
 * siguiente, así no quedan huecos muertos entre grupos y tocar cerca de
 * cualquiera de las dos barras selecciona el grupo completo.
 */
function computeTouchZones(layout: GroupLayout, groupCount: number, plotWidth: number): TouchZone[] {
  const pairWidth = layout.barWidth * 2 + layout.innerSpacing;
  const centers = Array.from(
    { length: groupCount },
    (_, index) => layout.edgeSpacing + index * (pairWidth + layout.groupGap) + pairWidth / 2
  );
  return centers.map((center, index) => {
    const left = index === 0 ? 0 : (centers[index - 1] + center) / 2;
    const right = index === groupCount - 1 ? plotWidth : (center + centers[index + 1]) / 2;
    return { left, width: Math.max(0, right - left) };
  });
}

/**
 * `1500` → `"1,5k"`, `1500000` → `"1,5M"`, `300` → `"300"`. Corto a
 * propósito: la librería reserva el ancho del eje Y según el número sin
 * formatear, así que una versión más larga (con separador de miles) queda
 * cortada a la mitad.
 */
function formatAxisLabel(value: number): string {
  const compact = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));
  if (value >= 1_000_000) return `${compact(value / 1_000_000)}M`;
  if (value >= 1_000) return `${compact(value / 1_000)}k`;
  return String(Math.round(value));
}

export function MovementsChart({ granularity, onChangeGranularity, currentBalance, points, loading }: Props) {
  const { colors, isDark } = useAppTheme();
  // En modo oscuro, `colors.background` casi no se distingue de
  // `colors.surface` (la tarjeta): las líneas de grilla quedaban
  // invisibles. Blanco traslúcido, en cambio, sí se ve sobre cualquiera
  // de los dos fondos oscuros.
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.35)' : colors.background;
  const [chartWidth, setChartWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const axis = useMemo(() => movementsAxisRange(points), [points]);
  const isYear = granularity === 'year';
  const chartHeight = AXIS_SECTION_HEIGHT * axis.sections;
  const chartWrapperHeight = chartHeight + LABELS_HEIGHT;

  const layout = chartWidth > 0 ? computeGroupLayout(chartWidth, points.length) : null;
  const plotWidth = chartWidth - Y_AXIS_LABEL_WIDTH;

  // La librería de gráficos no siempre vuelve a dibujar las barras cuando
  // sólo cambian los valores de `points` (p. ej. al agregar un movimiento
  // nuevo dentro del mismo modo): quedan con el alto de la carga anterior.
  // Forzamos que React la desmonte y monte de cero cada vez que cambian
  // los datos reales, no solo el modo, incluyéndolos en la `key`.
  const chartKey = `${granularity}-${points.map((point) => `${point.key}:${point.income}:${point.expenses}`).join('|')}`;

  const axisTextStyle = { ...styles.axisText, color: colors.textSecondary };

  // Un grupo son dos barras seguidas (ingreso, gasto). La etiqueta solo
  // se pone en la primera, con `labelWidth` cubriendo las dos, para que
  // quede centrada debajo del par y no solo debajo de la barra verde.
  //
  // La librería ancla esa caja al borde de la barra de ingreso (no al
  // centro del par) y le suma el ancho de `labelWidth` hacia la derecha:
  // con `labelWidth` ≈ ancho del par (Día/Mes) el corrimiento es
  // despreciable, pero en "Año" el label es mucho más ancho que el par
  // (para no truncar "Oct–Nov") y ese mismo corrimiento se nota mucho,
  // dejando el texto pegado a la derecha de sus barras. `labelComponent`
  // fuerza el corrimiento inverso a mano para recentrarlo.
  const pairWidth = layout ? layout.barWidth * 2 + layout.innerSpacing : 0;
  const yearLabelShift = layout ? pairWidth / 2 - YEAR_LABEL_WIDTH / 2 + layout.innerSpacing / 2 : 0;

  const barData: barDataItem[] = points.flatMap((point, index) => {
    const isLastBar = index === points.length - 1;
    return [
      {
        value: point.income,
        frontColor: colors.chartIncome,
        barWidth: layout?.barWidth,
        spacing: layout?.innerSpacing,
        labelWidth: isYear ? YEAR_LABEL_WIDTH : layout ? pairWidth : undefined,
        disablePress: true,
        label: isYear ? undefined : point.label,
        labelComponent: isYear
          ? () => (
              <View style={{ width: YEAR_LABEL_WIDTH, marginLeft: yearLabelShift, alignItems: 'center' }}>
                <Text style={axisTextStyle} numberOfLines={1}>
                  {point.label}
                </Text>
              </View>
            )
          : undefined,
      },
      {
        value: point.expenses,
        frontColor: colors.chartExpense,
        barWidth: layout?.barWidth,
        spacing: isLastBar ? 0 : layout?.groupGap,
        disablePress: true,
      },
    ];
  });

  const touchZones = layout && plotWidth > 0 ? computeTouchZones(layout, points.length, plotWidth) : [];
  const selectedPoint = selectedIndex !== null ? points[selectedIndex] : undefined;

  const hasMovements = currentBalance !== 0 || points.some((point) => point.income !== 0 || point.expenses !== 0);

  function handleLayout(event: LayoutChangeEvent) {
    setChartWidth(event.nativeEvent.layout.width);
  }

  function handleChangeGranularity(next: MovementsGranularity) {
    setSelectedIndex(null);
    onChangeGranularity(next);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Tus movimientos</Text>

      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Saldo actual</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {currentBalance < 0 ? '- ' : ''}
          {formatAmount(currentBalance)}
        </Text>
      </View>

      <View style={styles.legend}>
        <LegendItem color={colors.chartIncome} label="Ingresos" />
        <LegendItem color={colors.chartExpense} label="Gastos" />
      </View>

      {selectedPoint && <SelectionSummary point={selectedPoint} />}

      {!loading && !hasMovements ? (
        <EmptyState height={chartWrapperHeight} />
      ) : (
        <View style={[styles.chartWrapper, { height: chartWrapperHeight }]} onLayout={handleLayout}>
          {chartWidth > 0 && layout && barData.length > 0 && (
            <>
              <BarChart
                key={chartKey}
                data={barData}
                height={chartHeight}
                parentWidth={chartWidth}
                disableScroll
                isAnimated
                animationDuration={ANIMATION_DURATION}
                barBorderRadius={0}
                initialSpacing={layout.edgeSpacing}
                endSpacing={layout.edgeSpacing}
                yAxisThickness={0}
                yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
                xAxisColor={gridColor}
                xAxisThickness={1}
                xAxisLabelsHeight={LABELS_HEIGHT}
                xAxisLabelTextStyle={axisTextStyle}
                yAxisTextStyle={axisTextStyle}
                noOfSections={axis.sections}
                maxValue={axis.maxValue}
                stepValue={axis.step}
                rulesColor={gridColor}
                rulesType="dashed"
                dashWidth={4}
                dashGap={4}
                formatYLabel={(label) => formatAxisLabel(Number(label))}
              />
              <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                {touchZones.map((zone, index) => (
                  <Pressable
                    key={points[index]?.key ?? index}
                    accessibilityRole="button"
                    accessibilityLabel={points[index]?.periodLabel}
                    onPress={() => setSelectedIndex(index)}
                    style={[styles.touchZone, { left: Y_AXIS_LABEL_WIDTH + zone.left, width: zone.width }]}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      )}

      <PeriodToggle value={granularity} onChange={handleChangeGranularity} />
    </View>
  );
}

function SelectionSummary({ point }: { point: MovementsPoint }) {
  const { colors } = useAppTheme();
  const net = point.income - point.expenses;
  return (
    <View style={[styles.selection, { backgroundColor: colors.background }]}>
      <Text style={[styles.selectionDate, { color: colors.text }]}>{point.periodLabel}</Text>
      <SelectionRow
        colors={colors}
        label="Ingresos"
        value={formatSignedAmount(point.income, 'income')}
        color={colors.chartIncome}
      />
      <SelectionRow
        colors={colors}
        label="Gastos"
        value={formatSignedAmount(point.expenses, 'expense')}
        color={colors.chartExpense}
      />
      <SelectionRow
        colors={colors}
        label="Neto"
        value={`${net >= 0 ? '+' : '-'} ${formatAmount(Math.abs(net))}`}
        color={net >= 0 ? colors.chartIncome : colors.chartExpense}
      />
    </View>
  );
}

function SelectionRow({
  colors,
  label,
  value,
  color,
}: {
  colors: ColorPalette;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.selectionRow}>
      <Text style={[styles.selectionLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.selectionValue, { color }]}>{value}</Text>
    </View>
  );
}

function EmptyState({ height }: { height: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.empty, { height }]}>
      <IconCircle
        name="bar-chart-outline"
        size={56}
        color={colors.chartIncome}
        backgroundColor={colors.greenSofter}
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Todavía no hay movimientos</Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Cuando cargues un gasto o un ingreso, vas a ver acá la evolución de tu saldo.
      </Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    ...CardShadow,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  label: {
    fontSize: FontSize.caption,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },
  legendLabel: {
    fontSize: FontSize.caption,
  },
  chartWrapper: {
    width: '100%',
  },
  touchZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  axisText: {
    fontSize: FontSize.caption,
  },
  selection: {
    gap: 4,
    padding: Spacing.three,
    borderRadius: Radius.sm,
  },
  selectionDate: {
    fontSize: FontSize.small,
    fontWeight: '800',
    marginBottom: 2,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionLabel: {
    fontSize: FontSize.caption,
  },
  selectionValue: {
    fontSize: FontSize.small,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  emptyTitle: {
    fontSize: FontSize.body,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FontSize.small,
    textAlign: 'center',
  },
});
