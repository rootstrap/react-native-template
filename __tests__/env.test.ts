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

const loadEnv = (values: Record<string, string>, script: string) => {
  process.env = {
    ...process.env,
    ...values,
    APP_ENV: 'development',
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
      NAME: 'RootstrapApp',
    });
    expect(ClientEnv.VAR_NUMBER).toBe(10);
    expect(ClientEnv).not.toHaveProperty('SECRET_KEY');
  });

  it('keeps the static values over the ones in process.env', () => {
    const { Env } = loadEnv({ ...VALID_ENV, NAME: 'OtherName' }, RUN_SCRIPT);

    expect(Env.NAME).toBe('RootstrapApp');
  });

  it('throws when a variable is invalid and the env has to be validated', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      loadEnv({ ...VALID_ENV, VAR_NUMBER: 'abc' }, RUN_SCRIPT),
    ).toThrow('Invalid environment variables');
    expect(consoleError).toHaveBeenCalled();
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
