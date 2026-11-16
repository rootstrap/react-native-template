import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { useAuth } from '@/components/providers/auth';
import { Pressable, Text } from '@/components/ui';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib';

type TabBarIconProps = { color: string };

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
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: renderFeedIcon,
          headerRight: renderCreateNewPostLink,
          tabBarButtonTestID: 'feed-tab',
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          tabBarIcon: renderStyleIcon,
          tabBarButtonTestID: 'style-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: renderSettingsIcon,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

function CreateNewPostLink() {
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
}
