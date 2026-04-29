import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
<<<<<<< HEAD
=======
import * as React from 'react';
>>>>>>> f6309e9
import { useCallback, useEffect } from 'react';

import { useAuth } from '@/components/providers/auth';
import { Pressable, Text } from '@/components/ui';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
<<<<<<< HEAD
import { useIsFirstTime } from '@/lib';
=======
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
>>>>>>> f6309e9

export default function TabLayout() {
  const { isAuthenticated, ready } = useAuth();
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
<<<<<<< HEAD
    if (!ready) {
      hideSplash();
=======
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        hideSplash();
      }, 1000);
      return () => clearTimeout(timer);
>>>>>>> f6309e9
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
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          headerRight: () => <CreateNewPostLink />,
          tabBarButtonTestID: 'feed-tab',
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          tabBarIcon: ({ color }) => <StyleIcon color={color} />,
          tabBarButtonTestID: 'style-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

<<<<<<< HEAD
const CreateNewPostLink = () => (
  <Link href="/feed/add-post" asChild>
    <Pressable>
      <Text className="px-3 text-primary-300">Create</Text>
    </Pressable>
  </Link>
);
=======
function CreateNewPostLink() {
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
}
>>>>>>> f6309e9
