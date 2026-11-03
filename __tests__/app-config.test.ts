import type { ConfigContext, ExpoConfig } from '@expo/config';

type AppConfigFn = (context: ConfigContext) => ExpoConfig;

const loadConfigFor = (appEnv: string): ExpoConfig => {
  process.env.APP_ENV = appEnv;
  let appConfig: AppConfigFn | undefined;
  jest.isolateModules(() => {
    appConfig = require('../app.config').default;
  });
  if (!appConfig) {
    throw new Error('app.config.ts could not be loaded');
  }
  return appConfig({ config: {} } as ConfigContext);
};

const getExpoRouterOptions = (config: ExpoConfig) => {
  const entry = config.plugins?.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-router',
  );
  return Array.isArray(entry) ? entry[1] : undefined;
};

describe('app.config expo-router sitemap', () => {
  const originalAppEnv = process.env.APP_ENV;

  afterEach(() => {
    if (originalAppEnv === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = originalAppEnv;
    }
  });

  it('disables the sitemap route in production', () => {
    const config = loadConfigFor('production');

    expect(getExpoRouterOptions(config)).toEqual({ sitemap: false });
  });

  it.each(['development', 'qa', 'staging'])(
    'keeps the sitemap route in %s',
    (appEnv) => {
      const config = loadConfigFor(appEnv);

      expect(getExpoRouterOptions(config)).toEqual({ sitemap: true });
    },
  );
});
