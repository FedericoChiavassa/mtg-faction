import js from '@eslint/js';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

import prettier from 'eslint-config-prettier';

import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import perfectionist from 'eslint-plugin-perfectionist';
import pluginQuery from '@tanstack/eslint-plugin-query';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'build', '**/*.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactPlugin.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier, // MUST be last
    ],
    languageOptions: {
      parser: tsParser,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', 'tsconfig.node.json'],
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      react: reactPlugin,
      import: importPlugin,
      perfectionist: perfectionist,
      'react-hooks': reactHooks,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      '@tanstack/query': pluginQuery,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React
      'react/react-in-jsx-scope': 'off', // Not needed with Vite
      'react/jsx-uses-react': 'off',
      'react/no-unstable-nested-components': 'error',
      'react/jsx-no-useless-fragment': 'error',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Query
      ...pluginQuery.configs['flat/recommended'].rules,

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports' },
      ],

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Import sorting
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // React first
            ['^react', '^@?\\w'],
            // Internal aliases
            ['^@/'],
            // Relative imports
            ['^\\.'],
            // Side effects
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // Perfectionist rules
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'line-length',
          order: 'asc',
        },
      ],
    },
  },
  {
    // 👇 shadcn/ui escape hatch
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
