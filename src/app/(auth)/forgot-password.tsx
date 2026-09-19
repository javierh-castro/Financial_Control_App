import { useState } from 'react';

import { AuthFooterLink } from '@/components/auth/auth-footer-link';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthScreen } from '@/components/auth/auth-screen';
import { FormMessage } from '@/components/auth/form-message';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { supabase } from '@/lib/supabase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Ingresá un correo válido.');
      return;
    }
    setError(null);
    setSubmitting(true);
    // NOTA: `gastosmovil://reset-password` todavía no tiene pantalla
    // que reciba el deep link y complete el cambio de contraseña —
    // eso queda pendiente para cuando tengamos el proyecto de
    // Supabase real contra el cual probarlo.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'gastosmovil://reset-password',
    });
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthScreen>
        <AuthHeader
          icon="mail-outline"
          title="Revisá tu correo"
          subtitle={`Te mandamos instrucciones a ${email.trim()} para elegir una contraseña nueva.`}
        />
        <AuthFooterLink prompt="¿Ya la cambiaste?" actionLabel="Iniciar sesión" href="/login" />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthHeader
        icon="key-outline"
        title="Recuperar contraseña"
        subtitle="Te mandamos un correo para elegir una nueva"
      />

      <TextField
        icon="mail-outline"
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
      />

      {error ? <FormMessage text={error} /> : null}

      <PrimaryButton label="ENVIAR INSTRUCCIONES" onPress={handleSubmit} loading={submitting} />

      <AuthFooterLink prompt="¿Te acordaste?" actionLabel="Iniciar sesión" href="/login" />
    </AuthScreen>
  );
}
