import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    'prisma/migrations/**',
    'temp/**',
    '*.config.js',
    '*.config.mjs',
  ]),
  {
    rules: {
      // Disable most TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',

      // Disable React strict rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-no-comment-textnodes': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/immutability': 'off',

      // Disable general strict rules
      'no-console': 'off',
      'no-debugger': 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'off',
      'no-var': 'off',

      // Disable import rules
      'import/no-unresolved': 'off',
      'import/order': 'off',

      // Disable Next.js specific rules
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]);

export default eslintConfig;
