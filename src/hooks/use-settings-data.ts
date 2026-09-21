import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { getPreferences, setNotificationsEnabled } from '@/data/preferences';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { syncNow } from '@/services/sync-service';

type SettingsData = {
  /** Apodo mostrado en el perfil; sale de `user_metadata.full_name`. */
  nickname?: string;
  email?: string;
  notificationsEnabled: boolean;
  loading: boolean;
  savingNickname: boolean;
  nicknameError: string | null;
  toggleNotifications: (value: boolean) => void;
  /** Actualiza `user_metadata.full_name` en Supabase; requiere conexión. */
  saveNickname: (nickname: string) => Promise<boolean>;
};

/**
 * Datos de Ajustes. El apodo sale de `session.user.user_metadata.full_name`
 * (igual que el saludo del Home, ver `(tabs)/index.tsx`): no hace falta
 * espejarlo en SQLite porque la sesión de Supabase ya se persiste local.
 * `notificationsEnabled` sí vive en SQLite (`user_preferences`), porque es
 * un dato propio de la app que tiene que funcionar sin conexión.
 */
export function useSettingsData(): SettingsData {
  const db = useSQLiteContext();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [loading, setLoading] = useState(true);
  const [savingNickname, setSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const preferences = await getPreferences(db, userId);
    setNotificationsEnabledState(preferences.notificationsEnabled);
    setLoading(false);
  }, [db, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  function toggleNotifications(value: boolean) {
    setNotificationsEnabledState(value);
    if (!userId) return;
    setNotificationsEnabled(db, userId, value).then(() => syncNow(db, userId));
  }

  async function saveNickname(nickname: string): Promise<boolean> {
    setNicknameError(null);
    setSavingNickname(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: nickname } });
      if (error) {
        setNicknameError('No se pudo guardar. Revisá tu conexión e intentá de nuevo.');
        return false;
      }
      return true;
    } finally {
      setSavingNickname(false);
    }
  }

  return {
    nickname: session?.user.user_metadata.full_name,
    email: session?.user.email,
    notificationsEnabled,
    loading,
    savingNickname,
    nicknameError,
    toggleNotifications,
    saveNickname,
  };
}
