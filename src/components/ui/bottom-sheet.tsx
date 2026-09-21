import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/providers/theme-provider';

type Props = {
  isPresented: boolean;
  onDismiss: () => void;
  children?: ReactNode;
};

const ANIMATION_DURATION = 220;
const HIDDEN_OFFSET = 700;

/**
 * Bottom sheet propio sobre `Modal` + `Animated`, en vez de la
 * `BottomSheet` de `@expo/ui`: esa alojaba el formulario dentro de un
 * host nativo (SwiftUI `Group`) que no medía bien un árbol RN con varios
 * niveles de flex anidado — texto cortado en los campos y hojas que no
 * se ajustaban al contenido (quedaban casi a pantalla completa con
 * espacio vacío). Acá el layout lo resuelve React Native normal, sin esa
 * capa intermedia. Cada `children` es responsable de su propio scroll si
 * no entra en `maxHeight`.
 */
export function BottomSheet({ isPresented, onDismiss, children }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [translateY] = useState(() => new Animated.Value(isPresented ? 0 : 1));
  const [mounted, setMounted] = useState(isPresented);
  // Patrón de "ajustar estado en base a un cambio de prop" (sin efecto):
  // montar el Modal de inmediato cuando `isPresented` pasa a true, para
  // que la animación de entrada tenga algo visible sobre lo cual animar.
  const [prevPresented, setPrevPresented] = useState(isPresented);
  if (isPresented !== prevPresented) {
    setPrevPresented(isPresented);
    if (isPresented) {
      setMounted(true);
    }
  }

  useEffect(() => {
    if (!mounted) return;
    Animated.timing(translateY, {
      toValue: isPresented ? 0 : 1,
      duration: ANIMATION_DURATION,
      easing: isPresented ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isPresented) {
        setMounted(false);
      }
    });
  }, [isPresented, mounted, translateY]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
          onPress={onDismiss}
        />
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, paddingBottom: insets.bottom + Spacing.four },
            {
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, HIDDEN_OFFSET],
                  }),
                },
              ],
            },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.background }]} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(12, 26, 18, 0.4)',
  },
  sheet: {
    maxHeight: '88%',
    overflow: 'hidden',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    marginBottom: Spacing.four,
  },
});
