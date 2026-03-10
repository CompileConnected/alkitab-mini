import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import security from 'eslint-plugin-security';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default [
  // 1. Base ignores (Keep build artifacts clean)
  {
    ignores: ['dist/*', '.next/*', 'out/*', 'node_modules/*'],
  },

  // 2. The Main Application Logic
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        process: 'readonly',
        path: 'readonly',
        __dirname: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin,
      'jsx-a11y': jsxA11y,
      security: security,
      sonarjs: sonarjs,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // Recommended Defaults
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      ...security.configs.recommended.rules,

      // Your Senior-Level Customizations
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // Kill that 'missing in props validation' error
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],

      // Accessibility (A11y) specific tweaks for your Bible app
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      'sonarjs/no-duplicate-string': 'warn',
    },
  },

  // 3. Formatting (Always last!)
  prettierConfig,
];
