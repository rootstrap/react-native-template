import { getLocales } from 'expo-localization';

import { storage } from '../../../src/lib/storage';

jest.mock('../../../src/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
  },
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

const mockGetString = storage.getString as jest.Mock;
const mockGetLocales = getLocales as jest.Mock;

function loadI18n() {
  let i18n: typeof import('i18next').default | undefined;
  jest.isolateModules(() => {
    i18n = (require('../../../src/lib/i18n') as { default: typeof import('i18next').default }).default;
  });
  return i18n!;
}

describe('i18n initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLocales.mockReturnValue([{ languageTag: 'es-ES' }]);
  });

  it('should use the language selected in the app', () => {
    mockGetString.mockReturnValue('en');

    expect(loadI18n().language).toBe('en');
  });

  it('should use the OS language when no language is selected', () => {
    mockGetString.mockReturnValue(undefined);

    expect(loadI18n().language).toBe('es-ES');
  });
});
