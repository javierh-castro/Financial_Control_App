import * as Network from 'expo-network';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/providers/auth-provider';
import { syncNow } from '@/services/sync-service';

/**
 * Dispara `syncNow` sin que ninguna pantalla tenga que saber que existe:
 * al iniciar sesión (el efecto corre de nuevo cuando `userId` pasa de
 * `undefined` a tener valor), cuando la app vuelve al primer plano, y
 * cuando `expo-network` detecta que volvió la conexión. Se llama una
 * sola vez desde el layout raíz, no desde una pantalla.
 */
export function useSyncScheduler(): void {
  const db = useSQLiteContext();
  const { session } = useAuth();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;

    syncNow(db, userId);

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncNow(db, userId);
      }
    });

    const networkSubscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected && (state.isInternetReachable ?? true)) {
        syncNow(db, userId);
      }
    });

    return () => {
      appStateSubscription.remove();
      networkSubscription.remove();
    };
  }, [db, userId]);
}
