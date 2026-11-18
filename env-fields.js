/*
 * Helpers to declare environment variables in `env.js`.
 * Each `envField` builder returns a zod schema that receives the raw value read from `process.env`
 * (always a string or undefined), converts it to the right type and validates it.
 * This way every variable, including the static values set in `env.js`, is declared only once, with its type, in its schemas.
 *
 * Options:
 *    - optional: the variable may be missing or empty; its value will be `undefined`.
 *    - default: value used when the variable is missing or empty.
 *
 * An empty value (e.g. `API_URL=`) is treated the same as a missing one. Use the returned schema as is: chaining zod methods on it isn't supported.
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
 * Schemas created with the `envField` builders, used to make sure that every variable
 * read from `process.env` is converted from a string to its declared type.
 * @type {WeakSet<z.ZodTypeAny>}
 */
const envFieldSchemas = new WeakSet();

/** @param {z.ZodTypeAny} schema whether the schema was created with one of the `envField` builders */
const isEnvField = schema => envFieldSchemas.has(schema);

/**
 * Builds an env field schema: raw values are converted with `parse` (empty strings become `undefined`)
 * and then validated with `schema`, applying the `optional` and `default` options.
 * @template {z.ZodTypeAny} T
 * @template {EnvFieldOptions<T>} O
 * @param {T} schema
 * @param {(value: string) => unknown} parse
 * @param {O} [options]
 * @returns {EnvField<T, O>} the env field schema
 */
function createEnvField(schema, parse, options = /** @type {O} */ ({})) {
  /** @type {z.ZodTypeAny} */
  const optionalSchema = options.optional ? schema.optional() : schema;
  const inner = options.default === undefined ? optionalSchema : schema.default(options.default);
  const parseRaw = (/** @type {string} */ value) => (value === '' ? undefined : parse(value));
  const envFieldSchema = z.preprocess(value => (typeof value === 'string' ? parseRaw(value) : value), inner);
  envFieldSchemas.add(envFieldSchema);
  return /** @type {EnvField<T, O>} */ (envFieldSchema);
}

/**
 * Builds a zod error map that replaces the type errors of invalid values with a message
 * describing the accepted format and the received value, so it's clear how to fix it.
 * Missing values keep the default `Required` message.
 * @param {string} expected description of the accepted format
 * @returns {z.ZodErrorMap} the error map
 */
function invalidValueErrorMap(expected) {
  return (issue, ctx) => ({
    message: issue.code === 'invalid_type' && ctx.data !== undefined ? `must be ${expected}, received ${JSON.stringify(ctx.data)}` : ctx.defaultError,
  });
}

const DECIMAL_NUMBER_REGEX = /^-?\d+(?:\.\d+)?$/;

/**
 * Only plain decimal numbers (e.g. `42` or `-3.5`) are accepted; any other value
 * (e.g. `abc`, `Infinity`, `0x10`, `1e3`, values with spaces or too large to be finite) is returned as is so it's rejected.
 * @param {string} value
 */
function parseNumber(value) {
  return DECIMAL_NUMBER_REGEX.test(value) && Number.isFinite(Number(value)) ? Number(value) : value;
}

const BOOLEAN_REGEX = /^(?:true|false)$/i;

/**
 * Only `true` and `false` are accepted, case-insensitively (e.g. `TRUE` or `False`);
 * any other value (e.g. `1`, `yes` or values with spaces) is returned as is so it's rejected.
 * @param {string} value
 */
function parseBoolean(value) {
  return BOOLEAN_REGEX.test(value) ? value.toLowerCase() === 'true' : value;
}

const envField = {
  /**
   * @template {EnvFieldOptions<z.ZodString>} [O={}]
   * @param {O} [options]
   */
  string: options => createEnvField(z.string(), value => value, options),
  /**
   * @template {EnvFieldOptions<z.ZodNumber>} [O={}]
   * @param {O} [options]
   */
  number: options => createEnvField(z.number({ errorMap: invalidValueErrorMap('a plain decimal number (e.g. 42 or -3.5)') }).finite(), parseNumber, options),
  /**
   * @template {EnvFieldOptions<z.ZodBoolean>} [O={}]
   * @param {O} [options]
   */
  boolean: options => createEnvField(z.boolean({ errorMap: invalidValueErrorMap('\'true\' or \'false\'') }), parseBoolean, options),
  /**
   * @template {string} U
   * @template {Readonly<[U, ...U[]]>} V
   * @template {EnvFieldOptions<z.ZodEnum<z.Writeable<V>>>} [O={}]
   * @param {V} values
   * @param {O} [options]
   */
  enum: (values, options) => createEnvField(z.enum(values), value => value, options),
};

/**
 * Builds the object schema of a group of env fields; use `InferEnv` to get the type of its parsed values.
 * @template {z.ZodRawShape} T
 * @param {T} shape
 */
const envSchema = shape => z.object(shape);

/**
 * @template {z.ZodTypeAny} T
 * @typedef {z.infer<T>} InferEnv
 */

/**
 * Reads the raw value of every variable declared in the schema from `process.env`,
 * then overrides them with the static values defined in `env.js`.
 * Variables without a static value must be declared with an `envField` builder, as their raw
 * value is always a string; otherwise an error is thrown.
 * @param {z.AnyZodObject} schema
 * @param {Record<string, unknown>} staticValues
 * @returns {Record<string, unknown>} the raw values, ready to be parsed with the schema
 */
function readEnv(schema, staticValues) {
  /** @type {[string, z.ZodTypeAny][]} */
  const fields = Object.entries(schema.shape);
  const envValues = fields
    .filter(([key]) => !Object.hasOwn(staticValues, key))
    .map(([key, fieldSchema]) => {
      if (!isEnvField(fieldSchema)) {
        throw new Error(
          `The env variable "${key}" is read from process.env but it isn't declared with an envField builder. `
          + 'Declare it with envField.string(), envField.number(), envField.boolean() or envField.enum() in env.js, '
          + 'or set its value in the static values. Use the envField schema as returned: pass { optional, default } '
          + 'instead of chaining zod methods on it (e.g. .optional() or .describe()), which returns an untracked schema.',
        );
      }
      return [key, process.env[key]];
    });

  return {
    ...Object.fromEntries(envValues),
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

module.exports = { envField, envSchema, isEnvField, parseWithoutValidation, readEnv };
