<<<<<<< HEAD:src/components/settings/item.tsx
import React, { forwardRef } from 'react';
=======
import type { TxKeyPath } from '@/lib/i18n';
>>>>>>> f6309e9:src/features/settings/components/settings-item.tsx

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';

type ItemProps = {
  text: TxKeyPath;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
};

<<<<<<< HEAD:src/components/settings/item.tsx
export const Item = forwardRef<View, ItemProps>(
  ({ text, value, icon, onPress }: ItemProps, ref) => {
    const isPressable = onPress !== undefined;
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        pointerEvents={isPressable ? 'auto' : 'none'}
        className="flex-1 flex-row items-center justify-between px-4 py-2"
      >
        <View className="flex-row items-center">
          {icon && <View className="pr-2">{icon}</View>}
          <Text tx={text} />
        </View>
        <View className="flex-row items-center">
          <Text className="text-neutral-600 dark:text-white">{value}</Text>
          {isPressable && (
            <View className="pl-2">
              <ArrowRight />
            </View>
          )}
        </View>
      </Pressable>
    );
  },
);
=======
export function SettingsItem({ text, value, icon, onPress }: ItemProps) {
  const isPressable = onPress !== undefined;
  return (
    <Pressable
      onPress={onPress}
      pointerEvents={isPressable ? 'auto' : 'none'}
      className="flex-1 flex-row items-center justify-between px-4 py-2"
    >
      <View className="flex-row items-center">
        {icon && <View className="pr-2">{icon}</View>}
        <Text tx={text} />
      </View>
      <View className="flex-row items-center">
        <Text className="text-neutral-600 dark:text-white">{value}</Text>
        {isPressable && (
          <View className="pl-2">
            <ArrowRight />
          </View>
        )}
      </View>
    </Pressable>
  );
}
>>>>>>> f6309e9:src/features/settings/components/settings-item.tsx
