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

  return (
    <>
      <Stack.Screen options={screenOptions} />
      {typeof url === 'string'
        ? (
            <View className="flex-1 bg-white">
              <WebView
                source={{ uri: url }}
                className="flex-1"
                onError={() => router.back()}
              />
            </View>
          )
        : (
            <View className="flex-1 items-center justify-center bg-white">
              <Text className="text-lg text-red-500">
                {translate('www.invalidUrl')}
              </Text>
            </View>
          )}
    </>
  );
}
