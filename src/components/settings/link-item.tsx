import type { TxKeyPath } from '@/lib';
import { Link } from 'expo-router';
import * as React from 'react';
import { Platform } from 'react-native';

import { translate } from '@/lib';

import { Item } from './item';

type LinkItemProps = {
  text: TxKeyPath;
  url: string;
  icon?: React.ReactNode;
};

/**
 * Settings item that opens an external URL.
 * On web it renders an anchor that opens the URL in a new browser tab;
 * on native it navigates to the in-app WebView screen (`/www`).
 */
export function LinkItem({ text, url, icon }: LinkItemProps) {
  if (Platform.OS === 'web') {
    return (
      <Item
        text={text}
        icon={icon}
        role="link"
        externalHref={url}
      />
    );
  }

  return (
    <Link
      asChild
      href={{
        pathname: '/www',
        params: { url, title: translate(text) },
      }}
    >
      <Item text={text} icon={icon} />
    </Link>
  );
}
