import type { AuthError } from '@supabase/supabase-js';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthHeader } from '@/components/auth/auth-header';
import { AuthScreen } from '@/components/auth/auth-screen';
import { FormMessage } from '@/components/auth/form-message';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

function normalizeEmailParam(value: string | string[] | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed) ? trimmed : null;
}

/** Traduce errores de Supabase a mensajes propios; nunca se muestra error.message crudo. */
function describeError(error: AuthError, fallback: string): string {
  if (error.code === 'otp_expired') {
    return 'El código es incorrecto o venció. Pedí uno nuevo.';
  }
  if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') {
    return 'Hiciste demasiados intentos. Esperá un momento y volvé a probar.';
  }
  return fallback;
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email: emailParam } = useLocalSearchParams<{ email?: string | string[] }>();
  const email = normalizeEmailParam(emailParam);

  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) {
      router.replace('/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timeout = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  if (!email) {
    return null;
  }

  const handleChangeCode = (value: string) => {
    setError(null);
    setNotice(null);
    setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH));
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH || submitting) return;
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    setSubmitting(false);
    if (verifyError) {
      setError(describeError(verifyError, 'No pudimos verificar el código. Intentá nuevamente.'));
      return;
    }
    // Éxito: onAuthStateChange actualiza la sesión y Stack.Protected
    // en _layout.tsx navega solo a (tabs).
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setError(null);
    setNotice(null);
    setResending(true);
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    if (resendError) {
      setError(describeError(resendError, 'No pudimos reenviar el código. Intentá nuevamente.'));
      return;
    }
    setCode('');
    setSecondsLeft(RESEND_SECONDS);
    setNotice('Te mandamos un código nuevo.');
  };

  const resendDisabled = secondsLeft > 0 || resending;

  return (
    <AuthScreen>
      <AuthHeader
        icon="shield-checkmark-outline"
        title="Verificá tu correo"
        subtitle={`Ingresá el código de 6 dígitos que enviamos a ${email}`}
      />

      <TextField
        icon="key-outline"
        placeholder="Código de 6 dígitos"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        value={code}
        onChangeText={handleChangeCode}
      />

      {error ? <FormMessage text={error} /> : null}
      {!error && notice ? <FormMessage text={notice} tone="success" /> : null}

      <PrimaryButton
        label="VERIFICAR"
        onPress={handleVerify}
        loading={submitting}
        disabled={code.length !== CODE_LENGTH || resending}
      />

      <View style={styles.resendRow}>
        <Text style={styles.resendPrompt}>¿No te llegó? </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: resendDisabled }}
          onPress={resendDisabled ? undefined : handleResend}
          hitSlop={Spacing.two}>
          <Text style={[styles.resendLink, resendDisabled && styles.resendLinkDisabled]}>
            {secondsLeft > 0 ? `Reenviar código (0:${String(secondsLeft).padStart(2, '0')})` : 'Reenviar código'}
          </Text>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  resendPrompt: {
    fontSize: FontSize.small,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: FontSize.small,
    color: Colors.green,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    color: Colors.textSecondary,
  },
});
