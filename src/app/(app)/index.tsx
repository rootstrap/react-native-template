<<<<<<< HEAD
import { FocusAwareStatusBar, View } from '@/components/ui';
=======
import { FlashList } from '@shopify/flash-list';
import React from 'react';

import type { Post } from '@/api';
import { usePosts } from '@/api';
import { Card } from '@/components/card';
import { EmptyList, FocusAwareStatusBar, Text, View } from '@/components/ui';
>>>>>>> c7bb80d

export default function Feed() {
  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
    </View>
  );
}
