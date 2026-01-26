import { use } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../../src/translations/en.json';
import { storage } from '../../../src/lib/storage';
import type { TxKeyPath } from '../../../src/lib/i18n/utils';
import { getLanguage, translate } from '../../../src/lib/i18n/utils';

jest.mock('../../../src/lib/storage', () => ({
  storage: {
    getString: jest.fn().mockReturnValue('en'),
  },
}));

// eslint-disable-next-line react-hooks/rules-of-hooks
use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  ns: ['translationsNS'],
  defaultNS: 'translationsNS',

  debug: true,

  interpolation: {
    escapeValue: false,
  },

  resources: { en: { translationsNS: en } },
});

describe('getLanguage', () => {
  it('should call storage.getString with LOCAL', () => {
    const lang = getLanguage();
    expect(storage.getString).toHaveBeenCalledWith('local');
    expect(lang).toBe('en');
  });
});

describe('translate', () => {
  it('should return translated string', () => {
    const key: TxKeyPath = 'onboarding.title';
    const options = { lang: 'en' };
    const translatedString = translate(key, options);
    expect(translatedString).toBe('React Native Template');
  });
});
