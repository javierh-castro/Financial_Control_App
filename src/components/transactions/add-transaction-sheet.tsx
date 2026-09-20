import Ionicons from '@expo/vector-icons/Ionicons';
import * as Crypto from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormMessage } from '@/components/auth/form-message';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { DateField } from '@/components/ui/date-field';
import { IconCircle } from '@/components/ui/icon-circle';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { getActiveCategories, type Category } from '@/data/categories';
import { addTransaction } from '@/data/transactions';
import { useAuth } from '@/providers/auth-provider';
import { syncNow } from '@/services/sync-service';
import type { IconName, PaymentMethod, TransactionKind } from '@/types/finance';

const MAX_TITLE_LENGTH = 80;

type Props = {
  kind: TransactionKind;
  isPresented: boolean;
  onDismiss: () => void;
  /** Se llama tras guardar con éxito, para que el Home recargue sus datos. */
  onSaved: () => void;
};

const LABELS: Record<
  TransactionKind,
  { screenTitle: string; question: string; placeholder: string; cta: string; tint: string; soft: string; gradient: readonly [string, string] }
> = {
  expense: {
    screenTitle: 'Registrar gasto',
    question: '¿Qué gastaste?',
    placeholder: 'Ej. Supermercado, Netflix, Combustible...',
    cta: 'Guardar gasto',
    tint: Colors.red,
    soft: Colors.redSoft,
    gradient: [Colors.red, Colors.red],
  },
  income: {
    screenTitle: 'Registrar ingreso',
    question: '¿De qué es tu ingreso?',
    placeholder: 'Ej. Sueldo, Venta, Regalo...',
    cta: 'Guardar ingreso',
    tint: Colors.green,
    soft: Colors.greenSoft,
    gradient: [Colors.greenLight, Colors.green],
  },
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: IconName }[] = [
  { value: 'cash', label: 'Efectivo', icon: 'cash-outline' },
  { value: 'card', label: 'Tarjeta', icon: 'card-outline' },
  { value: 'transfer', label: 'Transferencia', icon: 'swap-horizontal-outline' },
];

/** Fecha en formato ISO (YYYY-MM-DD) en horario local, no UTC. */
function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseAmount(text: string): number {
  return Number(text.replace(',', '.').trim());
}

function validate(title: string, amountText: string, categoryId: string | null): string | null {
  if (!title.trim()) return 'Ingresá una descripción.';
  if (title.trim().length > MAX_TITLE_LENGTH) return 'La descripción es demasiado larga.';
  const amount = parseAmount(amountText);
  if (!Number.isFinite(amount) || amount <= 0) return 'Ingresá un monto válido, mayor a cero.';
  if (!categoryId) return 'Elegí una categoría.';
  return null;
}

type PickerItem = {
  key: string;
  icon: IconName;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

/** Lista de opciones dentro del mismo sheet, con un header con "Volver". */
function PickerList({
  title,
  items,
  onBack,
}: {
  title: string;
  items: PickerItem[];
  onBack: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.pickerHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          hitSlop={Spacing.three}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView style={styles.pickerScroll}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected: item.selected }}
            onPress={item.onSelect}
            style={({ pressed }) => [styles.pickerRow, pressed && styles.pressed]}>
            <IconCircle
              name={item.icon}
              size={36}
              color={item.selected ? Colors.textOnGreen : Colors.textSecondary}
              backgroundColor={item.selected ? Colors.green : Colors.background}
            />
            <Text style={styles.pickerRowLabel}>{item.label}</Text>
            {item.selected && <Ionicons name="checkmark" size={20} color={Colors.green} />}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * Bottom sheet compartido por "Agregar gasto" y "Agregar ingreso" del Home.
 * El selector de categoría solo lista categorías ya existentes
 * (`getActiveCategories`); crear una categoría nueva queda para otra
 * entrega.
 */
export function AddTransactionSheet({ kind, isPresented, onDismiss, onSaved }: Props) {
  const db = useSQLiteContext();
  const { session } = useAuth();
  const userId = session?.user.id;
  const labels = LABELS[kind];

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [activePicker, setActivePicker] = useState<'category' | 'paymentMethod' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isPresented || !userId) return;
    let cancelled = false;
    getActiveCategories(db, userId, kind).then((result) => {
      if (cancelled) return;
      setCategories(result);
      setCategoryId((current) => current ?? result[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [isPresented, userId, kind, db]);

  function reset() {
    setTitle('');
    setAmount('');
    setDate(new Date());
    setPaymentMethod('cash');
    setCategoryId(null);
    setActivePicker(null);
    setError(null);
  }

  function handleDismiss() {
    reset();
    onDismiss();
  }

  async function handleSubmit() {
    const validationError = validate(title, amount, categoryId);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!userId || !categoryId) return;

    setError(null);
    setSubmitting(true);
    try {
      await addTransaction(db, userId, {
        id: Crypto.randomUUID(),
        categoryId,
        title: title.trim(),
        amount: parseAmount(amount),
        kind,
        date: toIsoDate(date),
        paymentMethod,
      });
      onSaved();
      handleDismiss();
      // Empuja el movimiento ya mismo si hay Internet; si no, queda
      // 'pending' y lo levanta el próximo disparador (foreground/reconexión).
      syncNow(db, userId);
    } catch {
      setError('No se pudo guardar el movimiento. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;
  const selectedPaymentMethod = PAYMENT_METHODS.find((method) => method.value === paymentMethod)!;

  return (
    <BottomSheet isPresented={isPresented} onDismiss={handleDismiss}>
      {activePicker === 'category' ? (
        <PickerList
          title="Elegí una categoría"
          onBack={() => setActivePicker(null)}
          items={categories.map((category) => ({
            key: category.id,
            icon: category.icon,
            label: category.name,
            selected: category.id === categoryId,
            onSelect: () => {
              setCategoryId(category.id);
              setActivePicker(null);
            },
          }))}
        />
      ) : activePicker === 'paymentMethod' ? (
        <PickerList
          title="Elegí un método de pago"
          onBack={() => setActivePicker(null)}
          items={PAYMENT_METHODS.map((method) => ({
            key: method.value,
            icon: method.icon,
            label: method.label,
            selected: method.value === paymentMethod,
            onSelect: () => {
              setPaymentMethod(method.value);
              setActivePicker(null);
            },
          }))}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{labels.screenTitle}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoría</Text>
            {categories.length === 0 ? (
              <Text style={styles.emptyCategories}>
                Todavía no hay categorías de {kind === 'expense' ? 'gasto' : 'ingreso'} disponibles.
              </Text>
            ) : (
              <SelectField
                icon={selectedCategory?.icon ?? 'help-circle-outline'}
                iconColor={labels.tint}
                iconBackground={labels.soft}
                value={selectedCategory?.name ?? 'Elegí una categoría'}
                onPress={() => setActivePicker('category')}
              />
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{labels.question}</Text>
            <TextField
              icon="pricetag-outline"
              placeholder={labels.placeholder}
              value={title}
              onChangeText={setTitle}
              maxLength={MAX_TITLE_LENGTH}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Monto</Text>
              <TextField
                icon="cash-outline"
                placeholder="0,00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={[styles.fieldGroup, styles.rowItem]}>
              <Text style={styles.label}>Fecha</Text>
              <DateField value={date} onChange={setDate} accentColor={labels.tint} />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Método de pago</Text>
            <SelectField
              icon={selectedPaymentMethod.icon}
              iconColor={labels.tint}
              iconBackground={labels.soft}
              value={selectedPaymentMethod.label}
              onPress={() => setActivePicker('paymentMethod')}
            />
          </View>

          {error ? <FormMessage text={error} /> : null}

          <PrimaryButton
            label={labels.cta.toUpperCase()}
            icon="add-circle-outline"
            gradient={labels.gradient}
            onPress={handleSubmit}
            loading={submitting}
            disabled={categories.length === 0}
          />

          <View style={styles.scanButton}>
            <Ionicons name="scan-outline" size={20} color={Colors.textSecondary} />
            <View>
              <Text style={styles.scanLabel}>Escanear comprobante</Text>
              <Text style={styles.scanSubtitle}>(Próximamente)</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  title: {
    fontSize: FontSize.section,
    fontWeight: '800',
    color: Colors.text,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: FontSize.small,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rowItem: {
    flex: 1,
  },
  emptyCategories: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
    opacity: 0.6,
  },
  scanLabel: {
    fontSize: FontSize.small,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scanSubtitle: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pickerScroll: {
    maxHeight: 360,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pickerRowLabel: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.text,
  },
  pressed: {
    opacity: 0.7,
  },
});
