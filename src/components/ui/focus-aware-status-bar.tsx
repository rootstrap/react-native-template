import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';

type Props = { hidden?: boolean };
export function FocusAwareStatusBar({ hidden = false }: Props) {
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  if (Platform.OS === 'web') {
    return null;
  }

  return isFocused
    ? (
        <StatusBar
          style={colorScheme === 'light' ? 'dark' : 'light'}
          hidden={hidden}
        />
      )
    : null;
}
