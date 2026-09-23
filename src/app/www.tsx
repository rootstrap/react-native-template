import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Text } from '@/components/ui';
import { translate } from '@/lib';

export default function WWW() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams();

  const screenOptions = {
    presentation: 'modal',
    title: typeof title === 'string' ? title : '',
  } as const;

  if (url === undefined || typeof url !== 'string') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={screenOptions} />
        <Text className="text-lg text-red-500">
          {translate('www.invalidUrl')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={screenOptions} />
      <WebView
        source={{ uri: url }}
        className="flex-1"
        onError={() => router.back()}
      />
    </View>
  );
}
