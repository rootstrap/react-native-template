import type { TxKeyPath } from '@/lib';

import * as React from 'react';
import { Text, View } from '@/components/ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export function ItemsContainer({ children, title }: Props) {
  return (
    <View className="gap-2">
      {title && <Text className="text-lg" tx={title} />}
      <View className=" rounded-md border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
        {children}
      </View>
    </View>
  );
}
