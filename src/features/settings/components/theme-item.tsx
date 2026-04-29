<<<<<<< HEAD:src/components/settings/theme-item.tsx
import { useCallback, useMemo } from 'react';

=======
>>>>>>> f6309e9:src/features/settings/components/theme-item.tsx
import type { OptionType } from '@/components/ui';

import type { ColorSchemeType } from '@/lib/hooks/use-selected-theme';
import * as React from 'react';
import { Options, useModal } from '@/components/ui';
import { useSelectedTheme } from '@/lib/hooks/use-selected-theme';
import { translate } from '@/lib/i18n';

import { SettingsItem } from './settings-item';

export function ThemeItem() {
  const { selectedTheme, setSelectedTheme } = useSelectedTheme();
  const modal = useModal();

  const onSelect = useCallback(
    (option: OptionType) => {
      setSelectedTheme(option.value as ColorSchemeType);
      modal.dismiss();
    },
    [setSelectedTheme, modal],
  );

  const themes = useMemo(
    () => [
      { label: `${translate('settings.theme.dark')} 🌙`, value: 'dark' },
      { label: `${translate('settings.theme.light')} 🌞`, value: 'light' },
      { label: `${translate('settings.theme.system')} ⚙️`, value: 'system' },
    ],
    [],
  );

<<<<<<< HEAD:src/components/settings/theme-item.tsx
  const theme = useMemo(
    () => themes.find((t) => t.value === selectedTheme),
=======
  const theme = React.useMemo(
    () => themes.find(t => t.value === selectedTheme),
>>>>>>> f6309e9:src/features/settings/components/theme-item.tsx
    [selectedTheme, themes],
  );

  return (
    <>
      <SettingsItem
        text="settings.theme.title"
        value={theme?.label}
        onPress={modal.present}
      />
      <Options
        ref={modal.ref}
        options={themes}
        onSelect={onSelect}
        value={theme?.value}
      />
    </>
  );
}
