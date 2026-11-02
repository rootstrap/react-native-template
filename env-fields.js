/*
 * Helpers to declare environment variables in `env.js`.
 * Each `envField` builder returns a zod schema that receives the raw value read from `process.env`
 * (always a string or undefined), converts it to the right type and validates it.
 * This way every variable is declared only once, with its type, in the schemas defined in `env.js`.
 *
 * Options:
 *    - optional: the variable may be missing or empty; its value will be `undefined`.
 *    - default: value used when the variable is missing or empty.
 *
 * An empty value (e.g. `API_URL=`) is treated the same as a missing one.
 */
const z = require('zod');

/**
 * @template {z.ZodTypeAny} T
 * @typedef {{ optional?: boolean, default?: z.output<T> }} EnvFieldOptions
 */

/**
 * @template {z.ZodTypeAny} T
 * @template {EnvFieldOptions<T>} O
 * @typedef {O extends { default: {} } ? z.ZodDefault<T> : O extends { optional: true } ? z.ZodOptional<T> : T} EnvFieldInner
 */

/**
 * @template {z.ZodTypeAny} T
 * @template {EnvFieldOptions<T>} O
 * @typedef {z.ZodEffects<EnvFieldInner<T, O>, EnvFieldInner<T, O>['_output'], unknown>} EnvField
 */

/**
 * Builds an env field schema: raw values are converted with `parse` (empty strings become `undefined`)
 * and then validated with `schema`, applying the `optional` and `default` options.
 * @template {z.ZodTypeAny} T
 * @template {EnvFieldOptions<T>} O
 * @param {T} schema
 * @param {(value: string) => unknown} parse
 * @param {O} options
 * @returns {EnvField<T, O>} the env field schema
 */
function createEnvField(schema, parse, options) {
  /** @type {z.ZodTypeAny} */
  let inner = schema;
  if (options.default !== undefined) {
    inner = schema.default(options.default);
  }
  else if (options.optional) {
    inner = schema.optional();
  }

  return /** @type {EnvField<T, O>} */ (
    z.preprocess((value) => {
      if (value === undefined || value === '') {
        return undefined;
      }
      return typeof value === 'string' ? parse(value) : value;
    }, inner)
  );
}

const DECIMAL_NUMBER_REGEX = /^-?\d+(?:\.\d+)?$/;

/**
 * Only plain decimal numbers (e.g. `42` or `-3.5`) are accepted; any other value
 * (e.g. `abc`, `Infinity`, `0x10`, `1e3` or values with spaces) is rejected.
 * @param {string} value
 */
function parseNumber(value) {
  return DECIMAL_NUMBER_REGEX.test(value) ? Number(value) : Number.NaN;
}

/**
 * Only `true` and `false` are accepted; any other value is rejected.
 * @param {string} value
 */
function parseBoolean(value) {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return value;
}

const envField = {
  /**
   * @template {EnvFieldOptions<z.ZodString>} [O={}]
   * @param {O} [options]
   */
  string: options =>
    createEnvField(
      z.string(),
      value => value,
      /** @type {O} */ (options ?? {}),
    ),
  /**
   * @template {EnvFieldOptions<z.ZodNumber>} [O={}]
   * @param {O} [options]
   */
  number: options =>
    createEnvField(
      z.number().finite(),
      parseNumber,
      /** @type {O} */ (options ?? {}),
    ),
  /**
   * @template {EnvFieldOptions<z.ZodBoolean>} [O={}]
   * @param {O} [options]
   */
  boolean: options =>
    createEnvField(
      z.boolean(),
      parseBoolean,
      /** @type {O} */ (options ?? {}),
    ),
};

/**
 * Reads the raw value of every variable declared in the schema from `process.env`,
 * then overrides them with the static values defined in `env.js`.
 * @param {z.AnyZodObject} schema
 * @param {Record<string, unknown>} staticValues
 * @returns {Record<string, unknown>} the raw values, ready to be parsed with the schema
 */
function readEnv(schema, staticValues) {
  return {
    ...Object.fromEntries(
      Object.keys(schema.shape).map(key => [key, process.env[key]]),
    ),
    ...staticValues,
  };
}

/**
 * Parses every variable on its own, keeping `undefined` for the invalid ones instead of failing.
 * Used when the env variables don't need to be validated.
 * @param {z.AnyZodObject} schema
 * @param {Record<string, unknown>} values
 * @returns {Record<string, unknown>} the parsed values
 */
function parseWithoutValidation(schema, values) {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, fieldSchema]) => {
      const parsed = fieldSchema.safeParse(values[key]);
      return [key, parsed.success ? parsed.data : undefined];
    }),
  );
}

module.exports = { envField, parseWithoutValidation, readEnv };
