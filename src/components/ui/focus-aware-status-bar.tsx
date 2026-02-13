import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { useUniwind } from 'uniwind';

type Props = { hidden?: boolean };
export function FocusAwareStatusBar({ hidden = false }: Props) {
  const isFocused = useIsFocused();
  const { theme } = useUniwind();

<<<<<<< HEAD
  if (Platform.OS === 'web') {
    return null;
  }
=======
  if (Platform.OS === 'web')
    return null;
>>>>>>> f6309e9

  return isFocused
    ? (
        <SystemBars
          style={theme === 'light' ? 'dark' : 'light'}
          hidden={hidden}
        />
      )
    : null;
}
