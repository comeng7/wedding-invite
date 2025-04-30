// eslint.config.mjs
import pluginJs from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react'; // *** 추가 ***
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // React 17+ new JSX transform 사용 시 필요할 수 있음
        // sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact, // *** 추가 ***
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
      prettier: pluginPrettier,
      import: pluginImport,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules, // *** 추가: React 기본 규칙 ***
      // React 17+ new JSX transform 사용 시 아래 주석 해제 고려
      // ...pluginReact.configs['jsx-runtime'].rules, // *** 추가: JSX 런타임 규칙 (선택) ***
      ...pluginReactHooks.configs.recommended.rules,
      // Prettier 규칙은 맨 마지막에 배치하여 충돌 방지
      ...configPrettier.rules, // Prettier와 충돌 규칙 비활성화
      'prettier/prettier': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'import/order': [
        'warn', // 또는 'error'
        {
          // 그룹 순서 정의: react -> external -> internal -> relatives -> index/type/object
          groups: [
            'builtin', // Node.js 내장 모듈
            'external', // npm 패키지 (React 제외)
            'internal', // 내부 alias 경로 (@/)
            ['parent', 'sibling'], // 상대 경로 (../, ./)
            'index', // 현재 디렉토리 index 파일
            'type', // 타입 import
            'object', // <object> 태그 (사용하지 않으면 제거 가능)
          ],
          // 특정 패턴 경로 그룹 설정
          pathGroups: [
            {
              // 1순위: react 관련 패키지
              pattern: 'react**', // react, react-dom, react-router 등
              group: 'external', // external 그룹에 속하지만
              position: 'before', // external 그룹보다 앞에 위치
            },
            {
              // 2순위: 내부 alias (@/) 경로
              pattern: '@/**',
              group: 'internal',
              position: 'before', // internal 그룹이 상대 경로보다 앞에 오도록
            },
          ],
          // pathGroups 에서 정의한 패턴 타입은 기본 그룹핑에서 제외
          pathGroupsExcludedImportTypes: ['react', 'builtin'], // react**, builtin 제외
          'newlines-between': 'always', // 각 그룹 사이에 항상 빈 줄 추가
          alphabetize: {
            order: 'asc', // 그룹 내 알파벳 오름차순 정렬
            caseInsensitive: true, // 대소문자 구분 없이 정렬
          },
          // 경고 수준 설정 (선택 사항)
          warnOnUnassignedImports: true, // 할당되지 않은 import (예: import 'style.css') 에 대한 경고
        },
      ],

      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',

      'react/jsx-uses-react': 'off', // new JSX transform 사용 시 불필요
      'react/react-in-jsx-scope': 'off', // new JSX transform 사용 시 불필요
      'react/prop-types': 'off', // PropTypes 사용 안 하면 off
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.mjs'],
        },
        node: true,
      },
    },
  },
];
