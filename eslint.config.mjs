import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import pluginJest from 'eslint-plugin-jest';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import tailwind from 'eslint-plugin-tailwindcss';
import testingLibrary from 'eslint-plugin-testing-library';
// eslint-disable-next-line import/no-named-as-default, import/no-named-as-default-member, import/namespace
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import { configs, parser } from 'typescript-eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores([
    'dist/*',
    'node_modules',
    '__tests__/',
    'coverage',
    '.expo',
    '.expo-shared',
    'android',
    'ios',
    '.vscode',
    'docs/',
    'cli/',
    '*.config.js',
    'lint-staged.config.js',
    'i18next-syntax-validation.js',
    'env.js',
  ]),
  expoConfig,
  eslintPluginPrettierRecommended,
  ...tailwind.configs['flat/recommended'],
  reactCompiler.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      unicorn: eslintPluginUnicorn,
      'unused-imports': unusedImports,
      sonarjs,
      jest: pluginJest,
    },
    rules: {
      'import/no-duplicates': 'error',
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', 70],
      'tailwindcss/classnames-order': [
        'warn',
        {
          officialSorting: true,
        },
      ],
      'tailwindcss/no-custom-classname': 'off',
      'react/display-name': 'off',
      'react/no-inline-styles': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-useless-fragment': 'error',
      'react/no-children-prop': ['error', { allowFunctions: true }],
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-template': 'error',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['/android', '/ios'],
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      curly: [2, 'all'],
      'object-shorthand': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-console': ['error', { allow: ['error'] }],
      'guard-for-in': 'error',

      'import/prefer-default-export': 'off',
      'import/no-cycle': ['error', { maxDepth: '∞' }],
      'prettier/prettier': ['error', { ignores: ['expo-env.d.ts'] }],
    },
  },
  {
    files: ['**/__mocks__/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      ...configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        { ignoreArrayIndexes: true, ignoreEnums: true, ignore: [-1, 0, 1] },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
    },
  },
  {
    files: ['src/translations/*.json'],
    plugins: { 'i18n-json': i18nJsonPlugin },
    processor: {
      meta: { name: '.json' },
      ...i18nJsonPlugin.processors['.json'],
    },
    rules: {
      ...i18nJsonPlugin.configs.recommended.rules,
      '@typescript-eslint/ban-types': 'off',
      'i18n-json/valid-message-syntax': [
        2,
        {
          syntax: path.resolve(
            __dirname,
            './scripts/i18next-syntax-validation.js',
          ),
        },
      ],
      'i18n-json/valid-json': 2,
      'i18n-json/sorted-keys': [
        2,
        {
          order: 'asc',
          indentSpaces: 2,
        },
      ],
      'i18n-json/identical-keys': [
        2,
        {
          filePath: path.resolve(__dirname, './src/translations/en.json'),
        },
      ],
      'prettier/prettier': [
        0,
        {
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],
    },
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    plugins: { 'testing-library': testingLibrary },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },
]);
