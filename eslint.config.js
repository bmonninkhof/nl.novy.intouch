import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: [
      '.git/',
      'node_modules/',
      '.homeybuild/',
      '.homeycompose/',
      'assets/',
      'drivers/novy-hood/assets/',
      'drivers/novy-hood/pair/*.html',
      '*.svg',
      '*.jpg',
      '*.png'
    ],
    rules: {
      'no-console': 'off',
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];
