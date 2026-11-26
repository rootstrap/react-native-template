import type { NativeStackNavigationOptions } from 'expo-router';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { APIProvider } from '@/api';

import interceptors from '@/api/common/interceptors';
import { AnalyticsProvider } from '@/components/providers/analytics';
import { useAnalyticsScreenTracking, useAnalyticsSessionReset } from '@/components/providers/analytics-tracking';
import { AuthProvider, useAuth } from '@/components/providers/auth';
import { consoleAnalyticsProvider, hydrateAuth, loadSelectedTheme, useIsFirstTime } from '@/lib';
import { AUTH_SCREENS, AUTHENTICATED_SCREENS, isOnScreen } from '@/lib/auth/deep-link-path';
import { getFallbackRoute } from '@/lib/auth/get-fallback-route';
import { clearPendingDeepLink, usePendingDeepLink } from '@/lib/auth/pending-deep-link';
import { useSyncLanguageWithOS } from '@/lib/i18n';
import { useThemeConfig } from '@/lib/use-theme-config';
// Import  global CSS file
import '../../global.css';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(app)',
};

hydrateAuth();
loadSelectedTheme();
interceptors();
// Analytics providers the app reports to. Add real vendor adapters here.
const analyticsProviders = [consoleAnalyticsProvider];
// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

const GUARDED_SCREEN_OPTIONS: Readonly<Partial<Record<string, NativeStackNavigationOptions>>> = {
  '(app)': { headerShown: false },
  'sign-in': { headerShown: false },
};

function renderGuardedScreens(screens: ReadonlyArray<string>) {
  return screens.map(name => (
    <Stack.Screen key={name} name={name} options={GUARDED_SCREEN_OPTIONS[name]} />
  ));
}

function AnalyticsTrackers() {
  useAnalyticsSessionReset();
  useAnalyticsScreenTracking();
  return null;
}

function GuardedStack() {
  const { isAuthenticated } = useAuth();
  const [isFirstTime] = useIsFirstTime();
  const segments: ReadonlyArray<string> = useSegments();
  const pendingDeepLink = usePendingDeepLink.use.path();
  const fallbackRoute = getFallbackRoute({ isFirstTime, isAuthenticated, pendingDeepLink });
  const isWaitingForLogin = segments.length === 0
    || isOnScreen(segments, AUTH_SCREENS)
    || (!isAuthenticated && isOnScreen(segments, AUTHENTICATED_SCREENS));

  React.useEffect(() => {
    if (pendingDeepLink !== null && (isFirstTime || !isWaitingForLogin)) {
      clearPendingDeepLink();
    }
  }, [isFirstTime, isWaitingForLogin, pendingDeepLink]);

  return (
    <>
      <AnalyticsTrackers />
      <Stack>
        <Stack.Protected guard={isFirstTime} redirectTo={fallbackRoute}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated} redirectTo={fallbackRoute}>
          {renderGuardedScreens(AUTHENTICATED_SCREENS)}
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated} redirectTo={fallbackRoute}>
          {renderGuardedScreens(AUTH_SCREENS)}
        </Stack.Protected>

        <Stack.Screen
          name="www"
          options={{
            presentation: 'modal',
            title: '',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useSyncLanguageWithOS();

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
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <AuthProvider>
              <AnalyticsProvider providers={analyticsProviders}>
                <BottomSheetModalProvider>
                  {children}
                  <FlashMessage position="top" />
                </BottomSheetModalProvider>
              </AnalyticsProvider>
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
