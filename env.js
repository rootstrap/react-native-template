/* eslint-env node */
/*
 * Env file to load and validate env variables
 * Be cautious; this file should not be imported into your source folder. TODO: Add an eslint rule to prevent this.
 * We split the env variables into two parts:
 * 1. Client variables: These variables are used in the client-side code (src folder).
 * 2. Build-time variables: These variables are used in the build process (app.config.ts file).
 * Import this file into the `app.config.ts` file to use environment variables during the build process. The client variables can then be passed to the client-side using the extra field in the `app.config.ts` file.
 * To access the client environment variables in your `src` folder, you can import them from `@env`. For example: `import Env from '@env'`.
 */
/**
 * 1st part: Import packages and Load your env variables
 * we use dotenv to load the correct variables from the .env file based on the APP_ENV variable (default is development)
 * APP_ENV is passed as an inline variable while executing the command, for example: APP_ENV=staging pnpm build:android
 */
const z = require('zod');

const {
  envField,
  parseWithoutValidation,
  readEnv,
} = require('./env-fields');

const packageJSON = require('./package.json');
const path = require('node:path');

const APP_ENV =
  /** @type {z.infer<typeof clientEnvSchema>['APP_ENV']} */
  (process.env.APP_ENV) ?? 'development';

const isEASBuild = process.env.EAS_BUILD === 'true';

const LOCAL_BUILD_SCRIPT_PATTERNS = [
  '--local',
  'eas-cli-local-build-plugin',
  'expo export',
];
const isLocalBuild = LOCAL_BUILD_SCRIPT_PATTERNS.some((pattern) =>
  process.env.npm_lifecycle_script?.includes(pattern),
);

const EXPO_RUN_COMMANDS = ['expo start', 'expo run'];

const ENVIRONMENT_DEPENDANT_SCRIPTS = [
  ...EXPO_RUN_COMMANDS,
  'expo prebuild',
  'eas build',
  'eas-cli-local-build-plugin',
  'expo export',
];

const scriptIsEnvironmentDependant = ENVIRONMENT_DEPENDANT_SCRIPTS.some(
  (script) => process.env.npm_lifecycle_script?.includes(script),
);

// Check if the environment file has to be validated for the current running script and build method
const isBuilding = isEASBuild || isLocalBuild;
const isRunning = EXPO_RUN_COMMANDS.some((script) =>
  process.env.npm_lifecycle_script?.includes(script),
);
const shouldValidateEnv =
  (isBuilding && scriptIsEnvironmentDependant) || isRunning;

const environmentFiles = {
  development: process.env.ENVIRONMENT_FILE_DEVELOPMENT,
  qa: process.env.ENVIRONMENT_FILE_QA,
  production: process.env.ENVIRONMENT_FILE_PRODUCTION,
  staging: process.env.ENVIRONMENT_FILE_STAGING,
};

const easEnvironmentFilePath = environmentFiles[APP_ENV];
const localEnvironmentFilePath = path.resolve(__dirname, `.env.${APP_ENV}`);

const envPath = isEASBuild ? easEnvironmentFilePath : localEnvironmentFilePath;

require('dotenv').config({
  path: envPath,
});

/**
 * 2nd part: Define some static variables for the app
 * Such as: bundle id, package name, app name.
 *
 * You can add them to the .env file but we think it's better to keep them here as as we use prefix to generate this values based on the APP_ENV
 * for example: if the APP_ENV is staging, the bundle id will be com.rootstrap.staging
 */

// TODO: Replace these values with your own values

const BUNDLE_ID = 'com.rootstrap'; // ios bundle id
const PACKAGE = 'com.rootstrap'; // android package name
const NAME = 'RootstrapApp'; // app name
const EXPO_ACCOUNT_OWNER = 'rsdevs'; // expo account owner
const EAS_PROJECT_ID = '72fdf440-59f1-493d-96e3-4afad8d7a045'; // eas project id
const SCHEME = 'RootstrapApp'; // app scheme

/**
 * We declare a function withEnvSuffix that will add a suffix to the variable name based on the APP_ENV
 * Add a suffix to variable env based on APP_ENV
 * @param {string} name
 * @returns  {string}
 */

const withEnvSuffix = (name) =>
  APP_ENV === 'production' ? name : `${name}.${APP_ENV}`;

/**
 * 2nd part: Define your env variables schema
 * we use zod and the `envField` helpers (see `env-fields.js`) to define our env variables schema
 *
 * we split the env variables into two parts:
 *    1. client: These variables are used in the client-side code (`src` folder).
 *    2. buildTime: These variables are used in the build process (app.config.ts file). You can think of them as server-side variables.
 *
 * Main rules:
 *    1. If you need your variable on the client-side, you should add it to the client schema; otherwise, you should add it to the buildTime schema.
 *    2. Declare variables read from the `.env` file with `envField.string()`, `envField.number()` or `envField.boolean()`.
 *       Their values are read from `process.env` and converted to the declared type automatically, so you only declare them once.
 *       Every variable without a static value is read from `process.env`, so it must use an `envField` builder: declaring it with a plain zod schema (e.g. `z.number()`) throws an error.
 *    3. Static values defined in this file (such as NAME or BUNDLE_ID) are declared with plain zod schemas and their values are set in `clientStaticValues` or `buildTimeStaticValues`.
 *
 * Note: env fields are required by default; an empty value (e.g. `API_URL=`) is treated as missing.
 * Pass `{ optional: true }` to allow a missing value, or `{ default: value }` to fall back to a default value.
 * Read more about zod here: https://zod.dev/?id=strings
 *
 */

const clientEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'production', 'qa', 'staging']),
  NAME: z.string(),
  SCHEME: z.string(),
  BUNDLE_ID: z.string(),
  PACKAGE: z.string(),
  VERSION: z.string(),

  // ADD YOUR CLIENT ENV VARS HERE
  API_URL: envField.string(),
  VAR_NUMBER: envField.number(),
  VAR_BOOL: envField.boolean(),
  TERMS_OF_SERVICE_URL: envField.string(),
  WEBSITE_URL: envField.string(),
});

const buildTimeEnvSchema = z.object({
  EXPO_ACCOUNT_OWNER: z.string(),
  EAS_PROJECT_ID: z.string(),
  // ADD YOUR BUILD TIME ENV VARS HERE
  SECRET_KEY: envField.string(),
});

/**
 * @type {Partial<z.infer<typeof clientEnvSchema>>}
 */
const clientStaticValues = {
  APP_ENV,
  NAME,
  SCHEME,
  BUNDLE_ID: withEnvSuffix(BUNDLE_ID),
  PACKAGE: withEnvSuffix(PACKAGE),
  VERSION: packageJSON.version,
};

/**
 * @type {Partial<z.infer<typeof buildTimeEnvSchema>>}
 */
const buildTimeStaticValues = {
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID,
};

const _clientEnv = readEnv(clientEnvSchema, clientStaticValues);
const _buildTimeEnv = readEnv(buildTimeEnvSchema, buildTimeStaticValues);

/**
 * 3rd part: Merge and Validate your env variables
 * We use zod to validate our env variables based on the schema we defined above
 * If the validation fails we throw an error and log the error to the console with a detailed message about missed variables
 * If the validation passes we export the merged and parsed env variables to be used in the app.config.ts file as well as a ClientEnv object to be used in the client-side code
 **/

const _wholeEnv = {
  ..._clientEnv,
  ..._buildTimeEnv,
};
const wholeEnvSchema = buildTimeEnvSchema.merge(clientEnvSchema);

/**
 * @type {z.infer<typeof wholeEnvSchema>}
 */
let Env;

/**
 * @type {z.infer<typeof clientEnvSchema>}
 */
let ClientEnv;

if (shouldValidateEnv) {
  const parsedWholeEnv = wholeEnvSchema.safeParse(_wholeEnv);

  if (parsedWholeEnv.success === false) {
    const envFile = isEASBuild ? environmentFiles[APP_ENV] : `.env.${APP_ENV}`;

    const messages = [
      '❌ Invalid environment variables:',
      parsedWholeEnv.error.flatten().fieldErrors,

      `\n❌ Missing or invalid variables in \x1b[1m\x1b[4m\x1b[31m${envFile}\x1b[0m file. Make sure all required variables are defined with valid values in the \x1b[1m\x1b[4m\x1b[31m${envFile}\x1b[0m file.`,
    ];

    if (isLocalBuild) {
      messages.push(
        `\n💡 Tip: If you recently updated the \x1b[1m\x1b[4m\x1b[31m${envFile}\x1b[0m file and the error still persists, try restarting the server with the -cc flag to clear the cache.`,
      );
    }

    if (isEASBuild) {
      messages.push(
        `\n☁️ For \x1b[1m\x1b[32mEAS Build\x1b[0m deployments, ensure the secret\x1b[1m\x1b[4m\x1b[31m${environmentFiles[APP_ENV]} \x1b[0m is defined in Project Secrets and has the proper environment file attached.`,
      );
    }

    console.error(...messages);
    throw new Error(
      'Invalid environment variables, Check terminal for more details ',
    );
  }

  Env = parsedWholeEnv.data;
  ClientEnv = clientEnvSchema.parse(_clientEnv);
} else {
  // The env variables are only validated when running the app or when building it with one of the ENVIRONMENT_DEPENDANT_SCRIPTS
  // (for example, `eas update` isn't one of them).
  // For any other script, missing or invalid values don't fail: they end up as `undefined` in `Env` and `ClientEnv`,
  // and therefore in the `extra` field of the app config.
  // Don't worry about TypeScript here; if we don't need to validate the env variables is because we aren't using them
  //@ts-ignore
  Env = parseWithoutValidation(wholeEnvSchema, _wholeEnv);
  //@ts-ignore
  ClientEnv = parseWithoutValidation(clientEnvSchema, _clientEnv);
}

module.exports = {
  Env,
  ClientEnv,
  withEnvSuffix,
};
