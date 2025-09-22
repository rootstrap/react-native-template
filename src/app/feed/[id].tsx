import { Stack } from 'expo-router';

<<<<<<< HEAD
import { FocusAwareStatusBar, View } from '@/components/ui';
=======
import { usePost } from '@/api';
import {
  ActivityIndicator,
  FocusAwareStatusBar,
  Text,
  View,
} from '@/components/ui';
>>>>>>> c7bb80d

export default function Post() {
  return (
    <View className="flex-1 p-3 ">
      <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
      <FocusAwareStatusBar />
    </View>
  );
}
