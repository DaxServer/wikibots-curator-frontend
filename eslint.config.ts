import stylistic from '@stylistic/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

const extraFileExtensions = ['.vue'];

export default [
  {
    files: ['src/**/*.ts'],
    plugins: {
      '@stylistic': stylistic,
      '@typescript-eslint': typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: 'tsconfig.app.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions,
      },
    },
    rules: {
      ...typescriptPlugin.configs['eslint-recommended'].rules,
      ...typescriptPlugin.configs.recommended.rules,
    },
  },
];
