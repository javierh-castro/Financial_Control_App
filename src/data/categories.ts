import type { SQLiteDatabase } from 'expo-sqlite';

import type { IconName, TransactionKind } from '@/types/finance';

export type Category = {
  id: string;
  name: string;
  icon: IconName;
  kind: TransactionKind;
};

/**
 * Categorías activas del usuario (sin `deleted_at`), opcionalmente
 * filtradas por `kind`. Pensada para los selectores de "Agregar gasto" y
 * "Agregar ingreso": una categoría borrada nunca debe aparecer acá,
 * aunque siga en SQLite como borrado lógico (para sincronizar el borrado).
 */
export async function getActiveCategories(
  db: SQLiteDatabase,
  userId: string,
  kind?: TransactionKind
): Promise<Category[]> {
  if (kind) {
    return db.getAllAsync<Category>(
      `SELECT id, name, icon, kind
       FROM categories
       WHERE user_id = ? AND deleted_at IS NULL AND kind = ?
       ORDER BY name COLLATE NOCASE`,
      userId,
      kind
    );
  }

  return db.getAllAsync<Category>(
    `SELECT id, name, icon, kind
     FROM categories
     WHERE user_id = ? AND deleted_at IS NULL
     ORDER BY name COLLATE NOCASE`,
    userId
  );
}
