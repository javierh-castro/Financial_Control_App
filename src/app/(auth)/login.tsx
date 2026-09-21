import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthFooterLink } from '@/components/auth/auth-footer-link';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthScreen } from '@/components/auth/auth-screen';
import { FormMessage } from '@/components/auth/form-message';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { FontSize, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/providers/theme-provider';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('Completá correo y contraseña.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
    }
    // Con éxito, el AuthProvider detecta la sesión nueva y el
    // Stack.Protected de la raíz redirige solo a (tabs); no hace
    // falta navegar acá.
  }

  return (
    <AuthScreen>
      <AuthHeader icon="log-in-outline" title="Iniciar sesión" subtitle="Ingresá con tu cuenta" />

      <View style={styles.fields}>
        <TextField
          icon="mail-outline"
          placeholder="Correo electrónico"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          icon="lock-closed-outline"
          placeholder="Contraseña"
          secureTextEntry
          secureToggle
          textContentType="password"
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Link href="/forgot-password" style={[styles.forgot, { color: colors.green }]}>
        ¿Olvidaste tu contraseña?
      </Link>

      {error ? <FormMessage text={error} /> : null}

      <PrimaryButton label="INICIAR SESIÓN" onPress={handleSubmit} loading={submitting} />

      <AuthFooterLink prompt="¿No tenés cuenta?" actionLabel="Crear cuenta" href="/register" />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: Spacing.four },
  forgot: {
    alignSelf: 'flex-end',
    fontSize: FontSize.small,
    fontWeight: '600',
  },
});
