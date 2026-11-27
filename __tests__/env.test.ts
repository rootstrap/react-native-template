const VALID_ENV = {
  API_URL: 'https://api.example.com',
  VAR_NUMBER: '10',
  VAR_BOOL: 'true',
  TERMS_OF_SERVICE_URL: 'https://example.com/terms',
  WEBSITE_URL: 'https://example.com',
  SECRET_KEY: 'fake-secret-key',
};

const RUN_SCRIPT = 'expo start';
const OTHER_SCRIPT = 'jest';

type EnvModule = {
  Env: Record<string, unknown>;
  ClientEnv: Record<string, unknown>;
};

const loadEnv = (
  values: Record<string, string>,
  script: string,
  appEnv = 'development',
) => {
  process.env = {
    ...process.env,
    ...values,
    APP_ENV: appEnv,
    EAS_BUILD: 'false',
    npm_lifecycle_script: script,
  };
  let envModule: EnvModule | undefined;
  jest.isolateModules(() => {
    envModule = require('../env');
  });
  return envModule as EnvModule;
};

describe('env', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('reads and converts the declared variables when validating', () => {
    const { Env, ClientEnv } = loadEnv(VALID_ENV, RUN_SCRIPT);

    expect(Env).toMatchObject({
      API_URL: 'https://api.example.com',
      VAR_NUMBER: 10,
      VAR_BOOL: true,
      SECRET_KEY: 'fake-secret-key',
      NAME: expect.stringMatching(/\S/),
    });
    expect(ClientEnv.VAR_NUMBER).toBe(10);
    expect(ClientEnv).not.toHaveProperty('SECRET_KEY');
  });

  it('keeps the static values over the ones in process.env', () => {
    const baselineName = String(loadEnv(VALID_ENV, RUN_SCRIPT).Env.NAME);
    const { Env } = loadEnv({ ...VALID_ENV, NAME: `${baselineName}-other` }, RUN_SCRIPT);

    expect(Env.NAME).toBe(baselineName);
  });

  it('keeps the base scheme in production', () => {
    const { ClientEnv } = loadEnv(VALID_ENV, RUN_SCRIPT, 'production');

    expect(ClientEnv.SCHEME).toMatch(/^[A-Z][A-Z\d+.-]*$/i);
    expect(ClientEnv.SCHEME).not.toMatch(/\.(?:development|qa|staging|production)$/);
  });

  it.each(['development', 'qa', 'staging'])(
    'suffixes the scheme with the environment in %s',
    (appEnv) => {
      const productionScheme = loadEnv(VALID_ENV, RUN_SCRIPT, 'production')
        .ClientEnv.SCHEME;
      const { Env, ClientEnv } = loadEnv(VALID_ENV, RUN_SCRIPT, appEnv);

      expect(ClientEnv.SCHEME).toBe(`${productionScheme}.${appEnv}`);
      expect(Env.SCHEME).toBe(ClientEnv.SCHEME);
    },
  );

  it('throws and logs how to fix the invalid variables when the env has to be validated', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      loadEnv(
        { ...VALID_ENV, VAR_NUMBER: 'abc', VAR_BOOL: 'yes' },
        RUN_SCRIPT,
      ),
    ).toThrow('Invalid environment variables');
    expect(consoleError.mock.calls[0][1]).toMatchObject({
      VAR_NUMBER: [
        'must be a plain decimal number (e.g. 42 or -3.5), received "abc"',
      ],
      VAR_BOOL: ['must be \'true\' or \'false\', received "yes"'],
    });
  });

  it('returns undefined for invalid variables when the env is not validated', () => {
    const { Env, ClientEnv } = loadEnv(
      { ...VALID_ENV, VAR_NUMBER: 'abc', VAR_BOOL: 'yes' },
      OTHER_SCRIPT,
    );

    expect(Env.VAR_NUMBER).toBeUndefined();
    expect(Env.VAR_BOOL).toBeUndefined();
    expect(Env.API_URL).toBe('https://api.example.com');
    expect(ClientEnv.VAR_NUMBER).toBeUndefined();
  });
});
