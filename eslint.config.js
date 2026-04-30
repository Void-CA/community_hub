import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Base recommended
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Project setup
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Global ignores
  {
    ignores: ['dist/', 'node_modules/', '.astro/', 'coverage/'],
  },

  // TS source files (strict rules)
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Test files (relaxed rules)
  {
    files: ['src/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  // State files (DOM-heavy code, type checker false positives)
  {
    files: ['src/**/state/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },

  // Astro files
  ...pluginAstro.configs['flat/recommended'],
  {
    files: ['src/**/*.astro'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_' }],
    },
  },

  // Prettier (must be last to override conflicting rules)
  eslintConfigPrettier,
);
