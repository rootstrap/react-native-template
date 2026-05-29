import type { TextProps, TextStyle } from 'react-native';
import type { TxKeyPath } from '@/lib/i18n';
import { useMemo } from 'react';
import { I18nManager, Text as NNText, StyleSheet } from 'react-native';

import { twMerge } from 'tailwind-merge';
import { translate } from '@/lib/i18n';

type Props = {
  className?: string;
  tx?: TxKeyPath;
} & TextProps;

export function Text({
  className = '',
  style,
  tx,
  children,
  ...props
}: Props) {
  const textStyle = useMemo(
    () =>
      twMerge(
        'text-base text-black  dark:text-white  font-inter font-normal',
        className,
      ),
    [className],
  );

  const nStyle: TextStyle = useMemo(
    () =>
      StyleSheet.flatten([
        {
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]),
    [style],
  );
  return (
    <NNText className={textStyle} style={nStyle} {...props}>
      {tx ? translate(tx) : children}
    </NNText>
  );
}
