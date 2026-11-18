import { NavigationBar } from 'expo-navigation-bar';
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

  if (!isFocused) {
    return null;
  }

  const style = colorScheme === 'light' ? 'dark' : 'light';

  return (
    <>
      <StatusBar style={style} hidden={hidden} />
      <NavigationBar style={style} hidden={hidden} />
    </>
  );
}
