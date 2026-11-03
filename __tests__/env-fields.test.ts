import { z } from 'zod';

import { envField, parseWithoutValidation, readEnv } from '../env-fields';

const getErrorMessages = (schema: z.ZodTypeAny, value: unknown) =>
  schema.safeParse(value).error?.issues.map(issue => issue.message);

describe('envField', () => {
  describe('string', () => {
    it('returns the value as is', () => {
      expect(envField.string().parse('https://example.com')).toBe(
        'https://example.com',
      );
    });

    it('rejects missing and empty values by default', () => {
      expect(envField.string().safeParse(undefined).success).toBe(false);
      expect(envField.string().safeParse('').success).toBe(false);
    });

    it('returns undefined for missing or empty values when optional', () => {
      const schema = envField.string({ optional: true });

      expect(schema.parse(undefined)).toBeUndefined();
      expect(schema.parse('')).toBeUndefined();
      expect(schema.parse('value')).toBe('value');
    });

    it('returns the default value for missing or empty values', () => {
      const schema = envField.string({ default: 'fallback' });

      expect(schema.parse(undefined)).toBe('fallback');
      expect(schema.parse('')).toBe('fallback');
      expect(schema.parse('value')).toBe('value');
    });
  });

  describe('number', () => {
    it('parses numeric strings', () => {
      expect(envField.number().parse('42')).toBe(42);
      expect(envField.number().parse('0')).toBe(0);
      expect(envField.number().parse('-3.5')).toBe(-3.5);
    });

    it('rejects values that are not numbers', () => {
      expect(envField.number().safeParse('abc').success).toBe(false);
      expect(envField.number().safeParse('  ').success).toBe(false);
      expect(envField.number().safeParse('Infinity').success).toBe(false);
      expect(envField.number().safeParse('-Infinity').success).toBe(false);
      expect(envField.number().safeParse('0x10').success).toBe(false);
      expect(envField.number().safeParse('1e3').success).toBe(false);
      expect(envField.number().safeParse(' 42 ').success).toBe(false);
    });

    it('describes the accepted format and the received value when invalid', () => {
      expect(getErrorMessages(envField.number(), 'abc')).toEqual([
        'must be a plain decimal number (e.g. 42 or -3.5), received "abc"',
      ]);
      expect(getErrorMessages(envField.number({ optional: true }), '1e3')).toEqual([
        'must be a plain decimal number (e.g. 42 or -3.5), received "1e3"',
      ]);
    });

    it('rejects missing and empty values by default', () => {
      expect(envField.number().safeParse(undefined).success).toBe(false);
      expect(envField.number().safeParse('').success).toBe(false);
    });

    it('returns undefined for missing or empty values when optional', () => {
      const schema = envField.number({ optional: true });

      expect(schema.parse(undefined)).toBeUndefined();
      expect(schema.parse('')).toBeUndefined();
      expect(schema.safeParse('abc').success).toBe(false);
    });

    it('returns the default value for missing or empty values', () => {
      const schema = envField.number({ default: 4321 });

      expect(schema.parse(undefined)).toBe(4321);
      expect(schema.parse('')).toBe(4321);
      expect(schema.parse('8080')).toBe(8080);
    });
  });

  describe('boolean', () => {
    it('parses "true" and "false"', () => {
      expect(envField.boolean().parse('true')).toBe(true);
      expect(envField.boolean().parse('false')).toBe(false);
    });

    it('parses "true" and "false" case-insensitively', () => {
      expect(envField.boolean().parse('TRUE')).toBe(true);
      expect(envField.boolean().parse('True')).toBe(true);
      expect(envField.boolean().parse('FALSE')).toBe(false);
      expect(envField.boolean().parse('False')).toBe(false);
    });

    it('rejects any other value', () => {
      expect(envField.boolean().safeParse('yes').success).toBe(false);
      expect(envField.boolean().safeParse('1').success).toBe(false);
      expect(envField.boolean().safeParse('0').success).toBe(false);
      expect(envField.boolean().safeParse(' true ').success).toBe(false);
    });

    it('describes the accepted format and the received value when invalid', () => {
      expect(getErrorMessages(envField.boolean(), 'yes')).toEqual([
        'must be \'true\' or \'false\', received "yes"',
      ]);
      expect(getErrorMessages(envField.boolean({ default: false }), '1')).toEqual([
        'must be \'true\' or \'false\', received "1"',
      ]);
    });

    it('rejects missing and empty values by default', () => {
      expect(envField.boolean().safeParse(undefined).success).toBe(false);
      expect(envField.boolean().safeParse('').success).toBe(false);
    });

    it('returns undefined for missing or empty values when optional', () => {
      const schema = envField.boolean({ optional: true });

      expect(schema.parse(undefined)).toBeUndefined();
      expect(schema.parse('')).toBeUndefined();
    });

    it('returns the default value for missing or empty values', () => {
      const schema = envField.boolean({ default: false });

      expect(schema.parse(undefined)).toBe(false);
      expect(schema.parse('')).toBe(false);
      expect(schema.parse('true')).toBe(true);
    });
  });

  it('uses the default value when both optional and default are set', () => {
    const schema = envField.string({ optional: true, default: 'fallback' });

    expect(schema.parse(undefined)).toBe('fallback');
    expect(schema.parse('value')).toBe('value');
  });

  it('reports missing variables as required when used in an object schema', () => {
    const result = z
      .object({ API_URL: envField.string(), VAR_NUMBER: envField.number() })
      .safeParse({ API_URL: '', VAR_NUMBER: undefined });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors).toEqual({
      API_URL: ['Required'],
      VAR_NUMBER: ['Required'],
    });
  });
});

describe('readEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('reads the declared variables from process.env', () => {
    process.env.API_URL = 'https://api.example.com';
    process.env.UNDECLARED_VAR = 'ignored';
    const schema = z.object({
      API_URL: envField.string(),
      VAR_NUMBER: envField.number(),
    });

    expect(readEnv(schema, {})).toEqual({
      API_URL: 'https://api.example.com',
      VAR_NUMBER: undefined,
    });
  });

  it('overrides process.env with the static values', () => {
    process.env.NAME = 'FromEnvFile';
    const schema = z.object({ NAME: z.string() });

    expect(readEnv(schema, { NAME: 'StaticName' })).toEqual({
      NAME: 'StaticName',
    });
  });
});

describe('parseWithoutValidation', () => {
  const schema = z.object({
    API_URL: envField.string(),
    VAR_NUMBER: envField.number(),
    VAR_BOOL: envField.boolean({ default: false }),
  });

  it('parses the valid values', () => {
    expect(
      parseWithoutValidation(schema, {
        API_URL: 'https://api.example.com',
        VAR_NUMBER: '42',
        VAR_BOOL: 'true',
      }),
    ).toEqual({
      API_URL: 'https://api.example.com',
      VAR_NUMBER: 42,
      VAR_BOOL: true,
    });
  });

  it('returns undefined for invalid or missing values without throwing', () => {
    expect(
      parseWithoutValidation(schema, { VAR_NUMBER: 'abc', VAR_BOOL: 'yes' }),
    ).toEqual({
      API_URL: undefined,
      VAR_NUMBER: undefined,
      VAR_BOOL: undefined,
    });
  });

  it('applies default values for missing values', () => {
    expect(parseWithoutValidation(schema, {}).VAR_BOOL).toBe(false);
  });
});
