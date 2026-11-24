import type { ConfigContext, ExpoConfig } from '@expo/config';

type AppConfigFn = (context: ConfigContext) => ExpoConfig;

const loadConfigFor = (appEnv: string | undefined): ExpoConfig => {
  if (appEnv === undefined) {
    delete process.env.APP_ENV;
  } else {
    process.env.APP_ENV = appEnv;
  }
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
  const entry = config.plugins?.find((plugin) =>
    Array.isArray(plugin)
      ? plugin[0] === 'expo-router'
      : plugin === 'expo-router',
  );
  if (!Array.isArray(entry)) {
    throw new Error(
      `Expected the expo-router plugin to be configured as ['expo-router', options], received ${JSON.stringify(entry)}`,
    );
  }
  return entry[1];
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

  it('keeps the sitemap route when APP_ENV is unset (defaults to development)', () => {
    const config = loadConfigFor(undefined);

    expect(getExpoRouterOptions(config)).toEqual({ sitemap: true });
  });

  it('fails loudly when the expo-router entry has no options', () => {
    const config = { plugins: ['expo-router'] } as ExpoConfig;

    expect(() => getExpoRouterOptions(config)).toThrow(
      /Expected the expo-router plugin/,
    );
  });
});
