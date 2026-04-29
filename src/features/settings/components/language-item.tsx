<<<<<<< HEAD:src/components/settings/language-item.tsx
import React, { useCallback, useMemo } from 'react';

import type { OptionType } from '@/components/ui';
import { Options, useModal } from '@/components/ui';
import { translate, useSelectedLanguage } from '@/lib';
=======
import type { OptionType } from '@/components/ui';

>>>>>>> f6309e9:src/features/settings/components/language-item.tsx
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { Options, useModal } from '@/components/ui';
import { translate, useSelectedLanguage } from '@/lib/i18n';

import { SettingsItem } from './settings-item';

export function LanguageItem() {
  const { language, setLanguage } = useSelectedLanguage();
  const modal = useModal();
  const onSelect = useCallback(
    (option: OptionType) => {
      setLanguage(option.value as Language);
      modal.dismiss();
    },
    [setLanguage, modal],
  );

<<<<<<< HEAD:src/components/settings/language-item.tsx
  const langs = useMemo(
    () => [{ label: translate('settings.english'), value: 'en' }],
    [],
  );

  const selectedLanguage = useMemo(
    () => langs.find((lang) => lang.value === language),
=======
  const langs = React.useMemo(
    () => [
      { label: translate('settings.english'), value: 'en' },
      { label: translate('settings.arabic'), value: 'ar' },
    ],
    [],
  );

  const selectedLanguage = React.useMemo(
    () => langs.find(lang => lang.value === language),
>>>>>>> f6309e9:src/features/settings/components/language-item.tsx
    [language, langs],
  );

  return (
    <>
      <SettingsItem
        text="settings.language"
        value={selectedLanguage?.label}
        onPress={modal.present}
      />
      <Options
        ref={modal.ref}
        options={langs}
        onSelect={onSelect}
        value={selectedLanguage?.value}
      />
    </>
  );
}
