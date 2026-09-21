import type { SQLiteDatabase } from 'expo-sqlite';

export type Preferences = {
  notificationsEnabled: boolean;
};

/**
 * Preferencias del usuario. `INSERT OR IGNORE` cubre el primer login
 * antes de que corra el primer sync: crea la fila local con los
 * defaults de columna (equivalentes a los que siembra `handle_new_user`
 * del lado de Supabase) para no depender de la red para leerla.
 */
export async function getPreferences(db: SQLiteDatabase, userId: string): Promise<Preferences> {
  await db.runAsync(`INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)`, userId);
  const row = await db.getFirstAsync<{ notifications_enabled: number }>(
    `SELECT notifications_enabled FROM user_preferences WHERE user_id = ?`,
    userId
  );
  return { notificationsEnabled: (row?.notifications_enabled ?? 1) === 1 };
}

/** Actualiza el toggle de notificaciones; queda 'pending' para el próximo sync. */
export async function setNotificationsEnabled(
  db: SQLiteDatabase,
  userId: string,
  enabled: boolean
): Promise<void> {
  await db.runAsync(
    `INSERT INTO user_preferences (user_id, notifications_enabled, sync_status)
     VALUES (?, ?, 'pending')
     ON CONFLICT(user_id) DO UPDATE SET
       notifications_enabled = excluded.notifications_enabled,
       sync_status = 'pending'`,
    userId,
    enabled ? 1 : 0
  );
}
