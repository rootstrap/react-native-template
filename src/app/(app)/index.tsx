import { Link, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  FocusAwareStatusBar,
  Pressable,
  Text,
  View,
} from '@/components/ui';
import { Feed as FeedIcon } from '@/components/ui/icons';

export default function Feed() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 ">
      <Tabs.Screen
        options={{
          title: t('tabs.feed'),
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          headerRight: () => <CreateNewPostLink />,
          tabBarButtonTestID: 'feed-tab',
        }}
      />
      <FocusAwareStatusBar />
    </View>
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
