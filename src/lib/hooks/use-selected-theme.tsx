<<<<<<< HEAD
import { colorScheme, useColorScheme } from 'nativewind';
import { useCallback } from 'react';
=======
import * as React from 'react';
>>>>>>> f6309e9
import { useMMKVString } from 'react-native-mmkv';
import { Uniwind, useUniwind } from 'uniwind';

import { storage } from '../storage';

const SELECTED_THEME = 'SELECTED_THEME';
export type ColorSchemeType = 'light' | 'dark' | 'system';
/**
 * this hooks should only be used while selecting the theme
 * This hooks will return the selected theme which is stored in MMKV
 * selectedTheme should be one of the following values 'light', 'dark' or 'system'
 * don't use this hooks if you want to use it to style your component based on the theme use useUniwind from uniwind instead
 *
 */
<<<<<<< HEAD
export const useSelectedTheme = () => {
  const { setColorScheme } = useColorScheme();
=======
export function useSelectedTheme() {
  const { theme: _theme } = useUniwind();
>>>>>>> f6309e9
  const [theme, _setTheme] = useMMKVString(SELECTED_THEME, storage);

  const setSelectedTheme = useCallback(
    (t: ColorSchemeType) => {
      Uniwind.setTheme(t);
      _setTheme(t);
    },
<<<<<<< HEAD
    [setColorScheme, _setTheme],
=======
    [_setTheme],
>>>>>>> f6309e9
  );

  const selectedTheme = (theme ?? 'system') as ColorSchemeType;
  return { selectedTheme, setSelectedTheme } as const;
}
// to be used in the root file to load the selected theme from MMKV
export function loadSelectedTheme() {
  const theme = storage.getString(SELECTED_THEME);
  if (theme !== undefined) {
<<<<<<< HEAD
    colorScheme.set(theme as ColorSchemeType);
=======
    console.log('theme', theme);
    Uniwind.setTheme(theme as ColorSchemeType);
>>>>>>> f6309e9
  }
}
