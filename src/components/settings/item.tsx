import type { PressableProps } from 'react-native';
import type { TxKeyPath } from '@/lib';
import * as React from 'react';

import { forwardRef } from 'react';
import { Pressable, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';

type ItemProps = {
  text: TxKeyPath;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  role?: PressableProps['role'];
  /**
   * Web only: renders the row as an anchor (`<a href>`) that opens `externalHref`
   * in a new browser tab.
   */
  externalHref?: string;
};

export const Item = forwardRef<View, ItemProps>(
  ({ text, value, icon, onPress, role, externalHref }: ItemProps, ref) => {
    const isPressable = onPress !== undefined || externalHref !== undefined;
    // react-native-web renders a View with `href` as an `<a>` element.
    const anchorProps = externalHref === undefined
      ? {}
      : {
          href: externalHref,
          hrefAttrs: { target: '_blank', rel: 'noopener noreferrer' },
        };
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        role={role}
        {...anchorProps}
        pointerEvents={isPressable ? 'auto' : 'none'}
        className="flex-1 flex-row items-center justify-between px-4 py-2"
      >
        <View className="flex-row items-center">
          {icon !== undefined && <View className="pr-2">{icon}</View>}
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
