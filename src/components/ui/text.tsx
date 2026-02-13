<<<<<<< HEAD
import { useMemo } from 'react';
=======
/* eslint-disable better-tailwindcss/no-unknown-classes */
>>>>>>> f6309e9
import type { TextProps, TextStyle } from 'react-native';
import type { TxKeyPath } from '@/lib/i18n';
import * as React from 'react';
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
<<<<<<< HEAD
}: Props) => {
  const textStyle = useMemo(
    () =>
      twMerge(
        'text-base text-black  dark:text-white  font-inter font-normal',
=======
}: Props) {
  const textStyle = React.useMemo(
    () =>
      twMerge(
        'font-inter text-base font-normal text-black dark:text-white',
>>>>>>> f6309e9
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
<<<<<<< HEAD
      ]),
=======
      ]) as TextStyle,
>>>>>>> f6309e9
    [style],
  );
  return (
    <NNText className={textStyle} style={nStyle} {...props}>
      {tx ? translate(tx) : children}
    </NNText>
  );
}
