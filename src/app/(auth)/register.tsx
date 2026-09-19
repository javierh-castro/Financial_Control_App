import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthFooterLink } from '@/components/auth/auth-footer-link';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthScreen } from '@/components/auth/auth-screen';
import { FormMessage } from '@/components/auth/form-message';
import { CheckboxRow } from '@/components/ui/checkbox-row';
import { PrimaryButton } from '@/components/ui/primary-button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  acceptedTerms: boolean
): string | null {
  if (!fullName.trim()) return 'Ingresá tu nombre completo.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Ingresá un correo válido.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
  if (!acceptedTerms) return 'Tenés que aceptar los términos y condiciones.';
  return null;
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    const validationError = validate(fullName, email, password, confirmPassword, acceptedTerms);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthScreen>
        <AuthHeader
          icon="mail-outline"
          title="Revisá tu correo"
          subtitle={`Te mandamos un link de confirmación a ${email.trim()}.`}
        />
        <AuthFooterLink prompt="¿Ya confirmaste?" actionLabel="Iniciar sesión" href="/login" />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <AuthHeader
        icon="person-add-outline"
        title="Crear cuenta"
        subtitle="Completá tus datos para comenzar"
      />

      <View style={styles.fields}>
        <TextField
          icon="person-outline"
          placeholder="Nombre completo"
          autoCapitalize="words"
          textContentType="name"
          value={fullName}
          onChangeText={setFullName}
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
        <TextField
          icon="lock-closed-outline"
          placeholder="Contraseña"
          secureTextEntry
          secureToggle
          textContentType="newPassword"
          value={password}
          onChangeText={setPassword}
        />
        <TextField
          icon="lock-closed-outline"
          placeholder="Confirmar contraseña"
          secureTextEntry
          secureToggle
          textContentType="newPassword"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <CheckboxRow
        checked={acceptedTerms}
        onToggle={() => setAcceptedTerms((value) => !value)}
        label="Acepto los términos y condiciones"
      />

      {error ? <FormMessage text={error} /> : null}

      <PrimaryButton label="CREAR CUENTA" onPress={handleSubmit} loading={submitting} />

      <AuthFooterLink prompt="¿Ya tenés una cuenta?" actionLabel="Iniciar sesión" href="/login" />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: Spacing.four },
});
