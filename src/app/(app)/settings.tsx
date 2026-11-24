import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useDeleteUser, useUser } from '@/api/auth/use-user';
import { useAuth } from '@/components/providers/auth';
import { DeleteAccountItem } from '@/components/settings/delete-account-item';
import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { LinkItem } from '@/components/settings/link-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  colors,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Website } from '@/components/ui/icons';
import { translate } from '@/lib';
import { Env } from '@/lib/env';

export default function Settings() {
  const { logout } = useAuth();
  const { data: userData } = useUser();
  const { mutateAsync: deleteUserAsync } = useDeleteUser({
    onSuccess: () => {
      logout();
    },
    onError: error => showMessage({ message: error.message, type: 'danger' }),
  });
  const { colorScheme } = useColorScheme();
  const iconColor
    = colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  const handleDeleteUser = async () => {
    if (userData?.email == null || userData.email === '') {
      return;
    }
    await deleteUserAsync({ email: userData?.email });
  };

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 gap-2 p-4">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>
          <ItemsContainer title="settings.account.title">
            <Item text="settings.account.name" value={userData?.name ?? ''} />
            <Item
              text="settings.account.email"
              value={userData?.email ?? ''}
            />
            <Link
              asChild
              href={{
                pathname: '/update-password',
              }}
            >
              <Item text="settings.account.password" />
            </Link>
          </ItemsContainer>
          <ItemsContainer title="settings.general">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.links">
            <LinkItem text="settings.terms" url={Env.TERMS_OF_SERVICE_URL} />
            <LinkItem
              text="settings.website"
              url={Env.WEBSITE_URL}
              icon={<Website color={iconColor} />}
            />
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <DeleteAccountItem onDelete={() => { void handleDeleteUser(); }} />
              <Item text="settings.logout" onPress={logout} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
