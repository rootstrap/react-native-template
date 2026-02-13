import type { Theme } from '@react-navigation/native';
import {
  DarkTheme as _DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { useUniwind } from 'uniwind';

import colors from '@/components/ui/colors';

export const DarkTheme: Theme = {
  ..._DarkTheme,
  colors: {
    ..._DarkTheme.colors,
    primary: colors.primary[200],
    background: colors.charcoal[950],
    text: colors.charcoal[100],
    border: colors.charcoal[500],
    card: colors.charcoal[850],
  },
};

export const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[400],
    background: colors.white,
  },
};

export function useThemeConfig() {
  const { theme } = useUniwind();

<<<<<<< HEAD:src/lib/use-theme-config.tsx
  if (colorScheme === 'dark') {
    return DarkTheme;
  }
=======
  if (theme === 'dark')
    return DarkTheme;
>>>>>>> f6309e9:src/components/ui/use-theme-config.tsx

  return LightTheme;
}
