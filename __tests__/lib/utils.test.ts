import { Linking } from 'react-native';

import { createSelectors, openLinkInBrowser } from '../../src/lib/utils';

// Mock React Native Linking
jest.mock('react-native', () => ({
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

const mockLinking = Linking as jest.Mocked<typeof Linking>;

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openLinkInBrowser', () => {
    it('should open URL when canOpenURL returns true', async () => {
      const url = 'https://example.com';
      mockLinking.canOpenURL.mockResolvedValue(true);

      openLinkInBrowser(url);

      expect(mockLinking.canOpenURL).toHaveBeenCalledWith(url);

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLinking.openURL).toHaveBeenCalledWith(url);
    });

    it('should not open URL when canOpenURL returns false', async () => {
      const url = 'https://example.com';
      mockLinking.canOpenURL.mockResolvedValue(false);

      openLinkInBrowser(url);

      expect(mockLinking.canOpenURL).toHaveBeenCalledWith(url);

      // Wait for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLinking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('createSelectors', () => {
    it('should create selectors for store state', () => {
      const mockStore = {
        getState: () => ({ count: 0, name: 'test' }),
        use: {},
      } as unknown as Parameters<typeof createSelectors>[0];

      const storeWithSelectors = createSelectors(mockStore);

      expect(storeWithSelectors.use).toBeDefined();
      expect(
        typeof (storeWithSelectors.use as Record<string, unknown>).count,
      ).toBe('function');
      expect(
        typeof (storeWithSelectors.use as Record<string, unknown>).name,
      ).toBe('function');
    });
  });
});
