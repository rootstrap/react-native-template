import { consoleAnalyticsProvider } from '@/lib/analytics';

const devGlobal = globalThis as unknown as { __DEV__: boolean };

describe('consoleAnalyticsProvider', () => {
  let infoSpy: jest.SpyInstance;
  const originalDev = devGlobal.__DEV__;

  beforeEach(() => {
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    devGlobal.__DEV__ = originalDev;
    infoSpy.mockRestore();
  });

  it('logs every call in development builds', () => {
    devGlobal.__DEV__ = true;

    consoleAnalyticsProvider.init();
    consoleAnalyticsProvider.trackEvent('BUTTON_PRESS', { accessibilityId: 'login-button' });
    consoleAnalyticsProvider.trackScreen('/feed');
    consoleAnalyticsProvider.identify?.('user-1', { plan: 'free' });
    consoleAnalyticsProvider.reset?.();

    expect(infoSpy).toHaveBeenCalledTimes(5);
    expect(infoSpy).toHaveBeenNthCalledWith(1, '[analytics]', 'init');
    expect(infoSpy).toHaveBeenNthCalledWith(2, '[analytics]', 'event: BUTTON_PRESS', {
      accessibilityId: 'login-button',
    });
    expect(infoSpy).toHaveBeenNthCalledWith(3, '[analytics]', 'screen: /feed');
    expect(infoSpy).toHaveBeenNthCalledWith(4, '[analytics]', 'identify: user-1', { plan: 'free' });
    expect(infoSpy).toHaveBeenNthCalledWith(5, '[analytics]', 'reset');
  });

  it('is a no-op outside development builds', () => {
    devGlobal.__DEV__ = false;

    consoleAnalyticsProvider.init();
    consoleAnalyticsProvider.trackEvent('BUTTON_PRESS', { accessibilityId: 'login-button' });
    consoleAnalyticsProvider.trackScreen('/feed');

    expect(infoSpy).not.toHaveBeenCalled();
  });
});
