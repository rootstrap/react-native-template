import type { OptionType } from '@/components/ui';

import type { ColorSchemeType } from '@/lib';
import { useCallback, useMemo } from 'react';
import { Options, useModal } from '@/components/ui';
import { translate, useSelectedTheme } from '@/lib';

import { Item } from './item';

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

  const theme = useMemo(
    () => themes.find(t => t.value === selectedTheme),
    [selectedTheme, themes],
  );

  return (
    <>
      <Item
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
