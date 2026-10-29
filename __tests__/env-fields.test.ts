import { z } from 'zod';

import { envField } from '../env-fields';

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

    it('rejects any other value', () => {
      expect(envField.boolean().safeParse('yes').success).toBe(false);
      expect(envField.boolean().safeParse('1').success).toBe(false);
      expect(envField.boolean().safeParse('TRUE').success).toBe(false);
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
