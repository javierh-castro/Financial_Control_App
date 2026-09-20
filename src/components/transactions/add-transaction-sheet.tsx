import { BottomSheet } from '@expo/ui';
import * as Crypto from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FormMessage } from '@/components/auth/form-message';
import { IconCircle } from '@/components/ui/icon-circle';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { getActiveCategories, type Category } from '@/data/categories';
import { addTransaction } from '@/data/transactions';
import { useAuth } from '@/providers/auth-provider';
import { syncNow } from '@/services/sync-service';
import type { TransactionKind } from '@/types/finance';

const MAX_TITLE_LENGTH = 80;

type Props = {
  kind: TransactionKind;
  isPresented: boolean;
  onDismiss: () => void;
  /** Se llama tras guardar con éxito, para que el Home recargue sus datos. */
  onSaved: () => void;
};

const LABELS: Record<TransactionKind, { title: string; cta: string; tint: string; soft: string }> = {
  expense: { title: 'Agregar gasto', cta: 'GUARDAR GASTO', tint: Colors.red, soft: Colors.redSoft },
  income: { title: 'Agregar ingreso', cta: 'GUARDAR INGRESO', tint: Colors.green, soft: Colors.greenSoft },
};

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
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
    setCategoryId(null);
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
        date: todayIso(),
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

  return (
    <BottomSheet isPresented={isPresented} onDismiss={handleDismiss}>
      <View style={styles.content}>
        <Text style={styles.title}>{labels.title}</Text>

        <TextField
          icon="pricetag-outline"
          placeholder="Descripción"
          value={title}
          onChangeText={setTitle}
          maxLength={MAX_TITLE_LENGTH}
        />
        <TextField
          icon="cash-outline"
          placeholder="Monto"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        {categories.length === 0 ? (
          <Text style={styles.emptyCategories}>
            Todavía no hay categorías de {kind === 'expense' ? 'gasto' : 'ingreso'} disponibles.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}>
            {categories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setCategoryId(category.id)}
                  style={styles.categoryItem}>
                  <IconCircle
                    name={category.icon}
                    color={selected ? Colors.textOnGreen : labels.tint}
                    backgroundColor={selected ? labels.tint : labels.soft}
                  />
                  <Text style={styles.categoryLabel} numberOfLines={1}>
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {error ? <FormMessage text={error} /> : null}

        <PrimaryButton
          label={labels.cta}
          onPress={handleSubmit}
          loading={submitting}
          disabled={categories.length === 0}
        />
      </View>
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
  categories: {
    gap: Spacing.four,
    paddingVertical: Spacing.two,
  },
  categoryItem: {
    alignItems: 'center',
    gap: Spacing.one,
    width: 72,
  },
  categoryLabel: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyCategories: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
  },
});
