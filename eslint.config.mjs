import path from 'node:path';
import { fileURLToPath } from 'node:url';

import antfu from '@antfu/eslint-config';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
<<<<<<< HEAD
import pluginJest from 'eslint-plugin-jest';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactCompiler from 'eslint-plugin-react-compiler';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import tailwind from 'eslint-plugin-tailwindcss';
=======
import reactCompiler from 'eslint-plugin-react-compiler';
>>>>>>> f6309e9
import testingLibrary from 'eslint-plugin-testing-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

<<<<<<< HEAD
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
    'expo-env.d.ts',
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
=======
export default antfu(
  {
    // Enable React and TypeScript support
    react: true,
    typescript: true,

    // Disable JSON processing for translation files (handled by i18n-json plugin)
    jsonc: false,

    // Use ESLint Stylistic for formatting
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
>>>>>>> f6309e9
    },

    // Global ignores
    ignores: [
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
      'expo-env.d.ts',
      'migration/*',
    ],
  },

  // Custom rules
  {
    rules: {
      'import/no-duplicates': 'error',
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', 110],
      'react/display-name': 'off',
      'react/no-inline-styles': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
<<<<<<< HEAD
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-useless-fragment': 'error',
      'react/no-children-prop': ['error', { allowFunctions: true }],
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-template': 'error',
=======
      'react-refresh/only-export-components': 'warn', // Too strict for React Native
>>>>>>> f6309e9
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            '/android',
            '/ios',
            'README.md',
            'README-project.md',
            'ISSUE_TEMPLATE.md',
            'PULL_REQUEST_TEMPLATE.md',
          ],
        },
      ],
<<<<<<< HEAD
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
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/__mocks__/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
=======
      'node/prefer-global/process': 'off', // process is commonly used in React Native configs
      'ts/no-require-imports': 'off', // Sometimes needed for mocks
      'ts/no-use-before-define': 'off', // Allow forward references in React components
      'no-console': 'off', // Console is useful for debugging
      'no-cond-assign': 'off', // Allow assignment in conditions when intentional
      'regexp/no-super-linear-backtracking': 'off', // Relax regex performance rules
      'regexp/no-unused-capturing-group': 'off', // Allow unused capturing groups
>>>>>>> f6309e9
    },
  },

  // TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
<<<<<<< HEAD
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
=======
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'], // Prefer type over interface
      'react-hooks/refs': 'off', // Allow useRef without exhaustive-deps
      'ts/consistent-type-imports': [
        'warn',
>>>>>>> f6309e9
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
    },
  },

  // Better TailwindCSS plugin
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...betterTailwindcss.configs.recommended,
    settings: {
      'better-tailwindcss': {
        entryPoint: path.resolve(__dirname, './src/global.css'),
      },
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      'better-tailwindcss/no-unnecessary-whitespace': 'warn',
      'better-tailwindcss/no-unknown-classes': 'warn',
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off', // Can be too strict for some cases
    },
  },

  // React Compiler plugin
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },

  // i18n JSON validation
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
      'i18n-json/sorted-keys': [2, { order: 'asc', indentSpaces: 2 }],
      'i18n-json/identical-keys': [
        2,
        { filePath: path.resolve(__dirname, './src/translations/en.json') },
      ],
      // Disable conflicting rules for i18n JSON files
      'style/semi': 'off',
      'style/comma-dangle': 'off',
      'style/quotes': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },

  // Testing Library rules
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    plugins: { 'testing-library': testingLibrary },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },
);
