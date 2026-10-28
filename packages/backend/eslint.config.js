import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist', 'build'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Habilita variáveis globais do Node.js (process, console, etc.)
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off', // Permite usar console.log no backend
    },
  },
];