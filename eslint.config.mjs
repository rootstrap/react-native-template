import path from 'node:path';
import { fileURLToPath } from 'node:url';

import antfu from '@antfu/eslint-config';
import expoPlugin from 'eslint-plugin-expo';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import importX from 'eslint-plugin-import-x';
import reactCompiler from 'eslint-plugin-react-compiler';
import tailwind from 'eslint-plugin-tailwindcss';
import testingLibrary from 'eslint-plugin-testing-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default antfu(
  {
    react: true,
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    jsonc: false,
    markdown: false,

    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },

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
      '*.config.js',
      'lint-staged.config.js',
      'i18next-syntax-validation.js',
      'env.js',
    ],
  },

  // Scoped to JS/TS only — max-lines-per-function crashes on markdown/json parsers if global
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    rules: {
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', 75],
      'react/no-missing-component-display-name': 'off',
      'react/prefer-destructuring-assignment': 'off',
      'react/jsx-shorthand-fragment': 'error',
      'react/no-useless-fragment': 'error',
      'react/no-children-prop': 'error',
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-template': 'error',
      'curly': [2, 'all'],
      'object-shorthand': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-console': ['error', { allow: ['error'] }],
      'guard-for-in': 'error',
      'import/prefer-default-export': 'off',
      'import-x/no-cycle': ['error', { ignoreExternal: true }],
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
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
      // antfu enables these by default; disable to avoid code rewrites beyond formatting
      'node/prefer-global/process': 'off',
      'ts/no-use-before-define': 'off',
      'no-cond-assign': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'react-refresh/only-export-components': 'off',
      'react/no-forward-ref': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-dom/no-dangerously-set-innerhtml': 'off',
      'e18e/prefer-static-regex': 'off',
    },
  },

  // TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'],
      'ts/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      'react-hooks/refs': 'off',
      'ts/no-explicit-any': 'error',
      'ts/no-magic-numbers': [
        'error',
        { ignoreArrayIndexes: true, ignoreEnums: true, ignore: [-1, 0, 1] },
      ],
      'ts/array-type': ['error', { default: 'generic' }],
      'ts/prefer-nullish-coalescing': 'error',
      // Type-aware rules activated by tsconfigPath — disable until addressed individually
      'ts/no-unsafe-return': 'off',
      'ts/no-unsafe-argument': 'off',
      'ts/no-unsafe-call': 'off',
      'ts/no-unsafe-member-access': 'off',
      'ts/strict-boolean-expressions': 'off',
      'ts/no-floating-promises': 'off',
      'ts/no-misused-promises': 'off',
      'ts/unbound-method': 'off',
      'react/no-leaked-conditional-rendering': 'off',
    },
  },

  // Must come AFTER the TS block — flat config is last-wins.
  // axios.d.ts uses interface for module augmentation which cannot be rewritten as type.
  {
    files: ['**/*.d.ts'],
    rules: {
      'ts/consistent-type-definitions': 'off',
    },
  },

  // Mocks commonly use require() for dynamic imports
  {
    files: ['**/__mocks__/**'],
    rules: {
      'ts/no-require-imports': 'off',
      'ts/no-unsafe-assignment': 'off',
    },
  },

  ...tailwind.configs['flat/recommended'].map(config => ({
    ...config,
    rules: {
      ...config.rules,
      'tailwindcss/classnames-order': ['warn', { officialSorting: true }],
      'tailwindcss/no-custom-classname': 'off',
    },
  })),

  {
    plugins: { 'import-x': importX },
  },

  {
    plugins: { expo: expoPlugin },
    rules: {
      'expo/use-dom-exports': 'error',
      'expo/no-env-var-destructuring': 'error',
      'expo/no-dynamic-env-var': 'error',
    },
  },

  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
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
      'style/semi': 'off',
      'style/comma-dangle': 'off',
      'style/quotes': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },

  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    plugins: { 'testing-library': testingLibrary },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  },
);
