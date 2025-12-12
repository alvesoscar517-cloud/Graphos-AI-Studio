import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'dist-admin/**',
      'build/**',
      '*.min.js',
      'public/**',
      'backend/public/**',
      'backend-admin/public/**',
      'admin-panel/dist/**',
      'admin-panel/node_modules/**',
    ],
  },

  // Base config for all JS files
  js.configs.recommended,

  // React files (src/ and admin-panel/)
  {
    files: ['src/**/*.{js,jsx}', 'admin-panel/**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
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
        chrome: 'readonly', // Chrome Extension API
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Unused variables - warn for gradual cleanup
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],

      // Console statements - warn, will be stripped in production
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'warn',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General code quality
      'no-debugger': 'warn',
      'no-unreachable': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['warn', 'always', { null: 'ignore' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  // Backend files
  {
    files: ['backend/**/*.js', 'backend-admin/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-console': 'off', // Backend can use console for logging
      'no-debugger': 'warn',
      'no-unreachable': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },

  // Build scripts and config files
  {
    files: [
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      'build-*.js',
      'post-build.js',
      'setup-*.js',
      'wrap-*.js',
      'cleanup-*.cjs',
      'scripts/**/*.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-console': 'off', // Build scripts can use console
    },
  },
]
