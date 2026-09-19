import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  /** true mientras se lee la sesión persistida local al arrancar. */
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sesión de Supabase para toda la app.
 *
 * `getSession()` lee la sesión persistida en el dispositivo (sin red),
 * así la app arranca mostrando los datos del usuario aunque esté
 * offline. Después, `onAuthStateChange` la mantiene al día: la sesión
 * solo pasa a `null` ante un SIGNED_OUT real o un refresh token ya
 * vencido — un fallo de red al intentar refrescar el token no cierra
 * la sesión ni redirige al login (el SDK lo reintenta solo).
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return value;
}
