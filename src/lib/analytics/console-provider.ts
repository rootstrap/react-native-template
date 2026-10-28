import type { AnalyticsParams, AnalyticsProviderAdapter } from './types';

const PREFIX = '[analytics]';

function log(message: string, params?: AnalyticsParams) {
  if (!__DEV__) {
    return;
  }
  // eslint-disable-next-line no-console
  console.info(PREFIX, message, ...(params === undefined ? [] : [params]));
}

/**
 * Default provider: prints every call to the console in development builds
 * and does nothing in production. Replace or complement it with a real
 * vendor adapter in `src/app/_layout.tsx`.
 */
export const consoleAnalyticsProvider: AnalyticsProviderAdapter = {
  init: () => log('init'),
  trackEvent: (name, params) => log(`event: ${name}`, params),
  trackScreen: (screenName, params) => log(`screen: ${screenName}`, params),
  identify: (userId, traits) => log(`identify: ${userId}`, traits),
  reset: () => log('reset'),
};
