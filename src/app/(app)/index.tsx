import { Link, Tabs } from 'expo-router';

import {
  FocusAwareStatusBar,
  Pressable,
  Text,
  View,
} from '@/components/ui';
import { Feed as FeedIcon } from '@/components/ui/icons';

export default function Feed() {
  return (
    <View className="flex-1 ">
      <Tabs.Screen
        options={{
          title: 'Feed',
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
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
}
