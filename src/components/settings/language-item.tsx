import React, { useCallback, useMemo } from 'react';

import type { OptionType } from '@/components/ui';
import { Options, useModal } from '@/components/ui';
<<<<<<< HEAD
import { translate, useSelectedLanguage } from '@/lib';
=======
import { useSelectedLanguage } from '@/lib';
import { translate } from '@/lib';
>>>>>>> c7bb80d
import type { Language } from '@/lib/i18n/resources';

import { Item } from './item';

export const LanguageItem = () => {
  const { language, setLanguage } = useSelectedLanguage();
  const modal = useModal();
  const onSelect = useCallback(
    (option: OptionType) => {
      setLanguage(option.value as Language);
      modal.dismiss();
    },
    [setLanguage, modal],
  );

  const langs = useMemo(
    () => [{ label: translate('settings.english'), value: 'en' }],
    [],
  );

  const selectedLanguage = useMemo(
    () => langs.find((lang) => lang.value === language),
    [language, langs],
  );

  return (
    <>
      <Item
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
};
