import type TranslateOptions from 'i18next';
import { changeLanguage as i18nChangeLanguage, t } from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import RNRestart from 'react-native-restart';

import { storage } from '../storage';
import type { Language, resources } from './resources';
import type { RecursiveKeyOf } from './types';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = () => storage.getString(LOCAL); // 'Marc' getItem<Language | undefined>(LOCAL);

export const translate = memoize(
  (key: TxKeyPath, options = undefined) => t(key, options) as unknown as string,
  (key: TxKeyPath, options: typeof TranslateOptions) =>
    options ? key + JSON.stringify(options) : key,
);

export const changeLanguage = (lang: Language) => {
  i18nChangeLanguage(lang);
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (__DEV__) {
      NativeModules.DevSettings.reload();
    } else {
      RNRestart.restart();
    }
  } else if (Platform.OS === 'web') {
    window.location.reload();
  } else {
    throw new Error('Unexpected value for Platform.OS');
  }
};

export const useSelectedLanguage = () => {
  const [language, setLang] = useMMKVString(LOCAL);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLang(lang);
      if (lang !== undefined) {
        changeLanguage(lang);
      }
    },
    [setLang],
  );

  return { language, setLanguage };
};
