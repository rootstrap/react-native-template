import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
<<<<<<< HEAD
import React from 'react';
import { useTranslation } from 'react-i18next';
=======
import * as React from 'react';
>>>>>>> f6309e9
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { hydrateAuth } from '@/features/auth/use-auth-store';

<<<<<<< HEAD
import { APIProvider } from '@/api';
import interceptors from '@/api/common/interceptors';
import { AuthProvider, useAuth } from '@/components/providers/auth';
import { hydrateAuth, loadSelectedTheme, useIsFirstTime } from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';
=======
import { APIProvider } from '@/lib/api';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
// Import  global CSS file
import '../global.css';
>>>>>>> f6309e9

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
interceptors();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

function GuardedStack() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isFirstTime] = useIsFirstTime();

  return (
    <Stack>
      <Stack.Protected guard={isFirstTime}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="update-password"
          options={{
            title: t('updatePassword.title'),
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>

      <Stack.Screen
        name="www"
        options={{
          presentation: 'modal',
          title: '',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <RouterContent />
    </Providers>
  );
}

function RouterContent() {
  const { ready } = useAuth();

  if (!ready) {
    return <Stack />;
  }

  return <GuardedStack />;
}

function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = useThemeConfig();

  return (
    <GestureHandlerRootView
      style={styles.container}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <AuthProvider>
              <BottomSheetModalProvider>
                {children}
                <FlashMessage position="top" />
              </BottomSheetModalProvider>
            </AuthProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
