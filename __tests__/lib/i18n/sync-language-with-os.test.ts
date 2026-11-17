import type { AppStateStatus } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { AppState } from 'react-native';

import { storage } from '../../../src/lib/storage';
import {
  resolveLanguage,
  syncLanguageWithOS,
  useSyncLanguageWithOS,
} from '../../../src/lib/i18n/utils';

jest.mock('../../../src/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
  },
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

jest.mock('i18next', () => {
  const mockI18n = {
    language: 'en-US',
    changeLanguage: jest.fn(),
    t: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockI18n,
    changeLanguage: mockI18n.changeLanguage,
    t: mockI18n.t,
  };
});

const mockGetString = storage.getString as jest.Mock;
const mockGetLocales = getLocales as jest.Mock;
const mockChangeLanguage = i18n.changeLanguage as jest.Mock;

function mockDeviceLanguage(languageTag: string) {
  mockGetLocales.mockReturnValue([{ languageTag }]);
}

describe('resolveLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the language selected in the app', () => {
    mockGetString.mockReturnValue('en');
    mockDeviceLanguage('es-ES');

    expect(resolveLanguage()).toBe('en');
  });

  it('should return the OS language when no language is selected', () => {
    mockGetString.mockReturnValue(undefined);
    mockDeviceLanguage('es-ES');

    expect(resolveLanguage()).toBe('es-ES');
  });

  it('should return undefined when no language is available', () => {
    mockGetString.mockReturnValue(undefined);
    mockGetLocales.mockReturnValue([]);

    expect(resolveLanguage()).toBeUndefined();
  });
});

describe('syncLanguageWithOS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    i18n.language = 'en-US';
  });

  it('should change the language when the OS language changed and none is selected', () => {
    mockGetString.mockReturnValue(undefined);
    mockDeviceLanguage('es-ES');

    syncLanguageWithOS();

    expect(mockChangeLanguage).toHaveBeenCalledWith('es-ES');
  });

  it('should not change the language when the OS language did not change', () => {
    mockGetString.mockReturnValue(undefined);
    mockDeviceLanguage('en-US');

    syncLanguageWithOS();

    expect(mockChangeLanguage).not.toHaveBeenCalled();
  });

  it('should not change the language when a language is selected', () => {
    mockGetString.mockReturnValue('en');
    mockDeviceLanguage('es-ES');

    syncLanguageWithOS();

    expect(mockChangeLanguage).not.toHaveBeenCalled();
  });
});

describe('useSyncLanguageWithOS', () => {
  let listener: ((state: AppStateStatus) => void) | undefined;
  const mockRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    i18n.language = 'en-US';
    listener = undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, handler) => {
      listener = handler as (state: AppStateStatus) => void;
      return { remove: mockRemove };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update the language when the app comes to the foreground', () => {
    mockGetString.mockReturnValue(undefined);
    mockDeviceLanguage('es-ES');
    renderHook(() => useSyncLanguageWithOS());

    listener?.('active');

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(mockChangeLanguage).toHaveBeenCalledWith('es-ES');
  });

  it('should not update the language when the app goes to the background', () => {
    mockGetString.mockReturnValue(undefined);
    mockDeviceLanguage('es-ES');
    renderHook(() => useSyncLanguageWithOS());

    listener?.('background');

    expect(mockChangeLanguage).not.toHaveBeenCalled();
  });

  it('should not update the language on foreground when a language is selected', () => {
    mockGetString.mockReturnValue('en');
    mockDeviceLanguage('es-ES');
    renderHook(() => useSyncLanguageWithOS());

    listener?.('active');

    expect(mockChangeLanguage).not.toHaveBeenCalled();
  });

  it('should remove the listener on unmount', () => {
    const { unmount } = renderHook(() => useSyncLanguageWithOS());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
