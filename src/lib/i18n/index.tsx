<<<<<<< HEAD
import { getLocales } from 'expo-localization';
import i18n, { dir, use } from 'i18next';
=======
/* eslint-disable react-refresh/only-export-components */
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
>>>>>>> f6309e9
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import { resources } from './resources';
<<<<<<< HEAD
=======
import { getLanguage } from './utils';

>>>>>>> f6309e9
export * from './utils';

const locales = getLocales();

// eslint-disable-next-line react-hooks/rules-of-hooks
use(initReactI18next).init({
  resources,
<<<<<<< HEAD
  lng: locales[0]?.languageTag, // TODO: if you are not supporting multiple languages or languages with multiple directions you can set the default value to `en`
=======
  lng: getLanguage() || getLocales()[0]?.languageTag, // TODO: if you are not supporting multiple languages or languages with multiple directions you can set the default value to `en`
>>>>>>> f6309e9
  fallbackLng: 'en',
  compatibilityJSON: 'v4', // Updated to v4 for i18next compatibility

  // allows integrating dynamic values into translations.
  interpolation: {
    escapeValue: false, // escape passed in values to avoid XSS injections
  },
});

// Is it a RTL language?
export const isRTL: boolean = dir() === 'rtl';

I18nManager.allowRTL(isRTL);
I18nManager.forceRTL(isRTL);

export default i18n;
