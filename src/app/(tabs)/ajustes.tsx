import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { EditNicknameSheet } from '@/components/settings/edit-nickname-sheet';
import { ProfileCard } from '@/components/settings/profile-card';
import { SettingsRow } from '@/components/settings/settings-row';
import { SettingsSection } from '@/components/settings/settings-section';
import { Screen } from '@/components/ui/screen';
import { FontSize, Spacing } from '@/constants/theme';
import { useSettingsData } from '@/hooks/use-settings-data';
import { supabase } from '@/lib/supabase';
import { useAppTheme } from '@/providers/theme-provider';

export default function AjustesScreen() {
  const { colors, isDark, setDarkMode } = useAppTheme();
  const {
    nickname,
    email,
    notificationsEnabled,
    savingNickname,
    nicknameError,
    toggleNotifications,
    saveNickname,
  } = useSettingsData();
  const [editingNickname, setEditingNickname] = useState(false);

  async function handleSaveNickname(value: string) {
    const ok = await saveNickname(value);
    if (ok) setEditingNickname(false);
  }

  function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  return (
    <Screen>
      <Text style={[styles.header, { color: colors.text }]}>Perfil y ajustes</Text>
      <Text style={[styles.subheader, { color: colors.textSecondary }]}>
        Gestioná tu cuenta y preferencias
      </Text>

      <ProfileCard name={nickname} email={email} onPress={() => setEditingNickname(true)} />

      <SettingsSection title="Cuenta">
        <SettingsRow
          icon="person-outline"
          title="Editar apodo"
          subtitle="Tu nombre visible en la app"
          onPress={() => setEditingNickname(true)}
        />
        <SettingsRow
          icon="lock-closed-outline"
          title="Seguridad"
          subtitle="Cambiar contraseña"
          disabled
        />
        <SettingsRow
          icon="notifications-outline"
          title="Notificaciones"
          subtitle="Alertas y recordatorios"
          switchValue={notificationsEnabled}
          onSwitchChange={toggleNotifications}
        />
      </SettingsSection>

      <SettingsSection title="Preferencias">
        <SettingsRow
          icon={isDark ? 'moon' : 'moon-outline'}
          title="Modo oscuro"
          subtitle="Cambia los colores de la app"
          switchValue={isDark}
          onSwitchChange={setDarkMode}
        />
      </SettingsSection>

      <SettingsSection title="Datos">
        <SettingsRow
          icon="cloud-download-outline"
          title="Exportar datos"
          subtitle="Descargá tu información"
          disabled
        />
        <SettingsRow
          icon="trash-outline"
          title="Eliminar cuenta"
          subtitle="Esta acción no se puede deshacer"
          disabled
          danger
        />
      </SettingsSection>

      <Pressable
        accessibilityRole="button"
        onPress={handleSignOut}
        style={({ pressed }) => [
          styles.signOut,
          { backgroundColor: colors.redSoft },
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.signOutLabel, { color: colors.red }]}>Cerrar sesión</Text>
      </Pressable>

      <EditNicknameSheet
        isPresented={editingNickname}
        initialValue={nickname}
        saving={savingNickname}
        error={nicknameError}
        onDismiss={() => setEditingNickname(false)}
        onSave={handleSaveNickname}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheader: {
    fontSize: FontSize.body,
    marginTop: -Spacing.four,
  },
  signOut: {
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  signOutLabel: {
    fontSize: FontSize.body,
    fontWeight: '800',
  },
});
