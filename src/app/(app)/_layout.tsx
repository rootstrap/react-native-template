import type { ColorValue } from 'react-native';
import { Link, Redirect, SplashScreen, Stack, Tabs } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/components/providers/auth';
import { Pressable, Text } from '@/components/ui';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
import { translate, useIsFirstTime } from '@/lib';

type TabBarIconProps = { color: ColorValue };

function renderFeedIcon({ color }: TabBarIconProps) {
  return <FeedIcon color={color} />;
}

function renderStyleIcon({ color }: TabBarIconProps) {
  return <StyleIcon color={color} />;
}

function renderSettingsIcon({ color }: TabBarIconProps) {
  return <SettingsIcon color={color} />;
}

function renderCreateNewPostLink() {
  return <CreateNewPostLink />;
}

export default function TabLayout() {
  const { isAuthenticated, ready } = useAuth();
  const [isFirstTime] = useIsFirstTime();
  const { t } = useTranslation();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!ready) {
      void hideSplash();
    }
  }, [hideSplash, ready]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (!isAuthenticated && ready) {
    return <Redirect href="/sign-in" />;
  }
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.feed'),
            tabBarIcon: renderFeedIcon,
            headerRight: renderCreateNewPostLink,
            tabBarButtonTestID: 'feed-tab',
          }}
        />
        <Tabs.Screen
          name="style"
          options={{
            title: t('tabs.style'),
            tabBarIcon: renderStyleIcon,
            tabBarButtonTestID: 'style-tab',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: translate('settings.title'),
            tabBarIcon: renderSettingsIcon,
            tabBarButtonTestID: 'settings-tab',
          }}
        />
      </Tabs>
    </>
  );
}

function CreateNewPostLink() {
  const { t } = useTranslation();

  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">{t('tabs.create')}</Text>
      </Pressable>
    </Link>
  );
}
