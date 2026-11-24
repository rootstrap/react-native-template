import type { TOptions } from 'i18next';
import type { Language, resources } from './resources';
import type { RecursiveKeyOf } from './types';
import { getLocales } from 'expo-localization';
import i18n, { changeLanguage as i18nChangeLanguage, t } from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback, useEffect } from 'react';
import { AppState, NativeModules, Platform } from 'react-native';

import { useMMKVString } from 'react-native-mmkv';
import RNRestart from 'react-native-restart';
import { storage } from '../storage';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = () => storage.getString(LOCAL); // 'Marc' getItem<Language | undefined>(LOCAL);

// Language tag of the first preferred OS locale, e.g. 'en-US'
export function getDeviceLanguage(): string | undefined {
  return getLocales()[0]?.languageTag;
}

// The language selected in the app wins over the OS language
export function resolveLanguage(): string | undefined {
  return getLanguage() ?? getDeviceLanguage();
}

// Follows the OS language when no language was selected in the app
export function syncLanguageWithOS() {
  if (getLanguage() !== undefined) {
    return;
  }
  const deviceLanguage = getDeviceLanguage();
  if (deviceLanguage !== undefined && deviceLanguage !== i18n.language) {
    void i18nChangeLanguage(deviceLanguage);
  }
}

// The OS language can change while the app is in the background,
// so it is read again every time the app comes back to the foreground
export function useSyncLanguageWithOS() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncLanguageWithOS();
      }
    });
    return () => subscription.remove();
  }, []);
}

export const translate = memoize(

  (key: TxKeyPath, options?: Record<string, unknown>) => t(key, options as TOptions),
  (key: TxKeyPath, options?: unknown) =>
    options === undefined ? key : `${key}${JSON.stringify(options)}`,
) as (key: TxKeyPath, options?: Record<string, unknown>) => string;

export function changeLanguage(lang: Language) {
  void i18nChangeLanguage(lang);
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (__DEV__) {
      (NativeModules.DevSettings as { reload: () => void }).reload();
    }
    else {
      RNRestart.restart();
    }
  }
  else if (Platform.OS === 'web') {
    window.location.reload();
  }
  else {
    throw new Error('Unexpected value for Platform.OS');
  }
}

export function useSelectedLanguage() {
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
}
