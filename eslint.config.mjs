// eslint.config.mjs
import pluginJs from '@eslint/js';
import configPrettier from 'eslint-config-prettier'; // Prettier와 충돌하는 ESLint 규칙 비활성화
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    // 전체 파일에 적용될 기본 설정
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // JSX 파싱 활성화
        },
      },
      globals: {
        ...globals.browser, // 브라우저 전역 변수 (window 등) 인식
        ...globals.node, // Node.js 전역 변수 (process 등) 인식
      },
    },
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
      prettier: pluginPrettier, // Prettier 규칙을 ESLint 규칙으로 실행
      import: pluginImport, // Import 관련 규칙 플러그인
    },
    rules: {
      ...pluginJs.configs.recommended.rules, // @eslint/js 기본 규칙
      ...pluginReactHooks.configs.recommended.rules, // React Hooks 규칙
      ...configPrettier.rules, // Prettier와 충돌하는 규칙 비활성화 (반드시 맨 뒤에)
      'prettier/prettier': 'warn', // Prettier 규칙 위반 시 경고 표시
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // --- Import 순서 규칙 설정 ---
      'import/order': [
        'warn', // 오류 대신 경고로 표시 (자동 수정 가능)
        {
          groups: [
            'builtin', // Node.js 내장 모듈 (fs, path 등)
            'external', // npm 패키지
            'internal', // 내부 모듈 (@/...)
            'parent', // 부모 디렉토리 (../)
            'sibling', // 형제 디렉토리 (./)
            'index', // 현재 디렉토리 index 파일 (./)
            'object', // 객체 형태의 import (사용하지 않으면 제거)
            'type', // 타입 import (TypeScript 사용 시)
          ],
          pathGroups: [
            // @/ 로 시작하는 경로를 internal 그룹으로 지정
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'], // 내장 모듈은 pathGroups 규칙에서 제외
          'newlines-between': 'always', // 그룹 사이에 항상 빈 줄 추가
          alphabetize: {
            order: 'asc', // 그룹 내 알파벳 오름차순 정렬
            caseInsensitive: true, // 대소문자 구분 없이 정렬
          },
        },
      ],
      'import/no-unresolved': 'off', // alias 사용 시 경로 못 찾는 오류 비활성화 (resolver가 처리)
      'import/prefer-default-export': 'off', // default export 강제 비활성화 (선호에 따라)
    },
    settings: {
      react: {
        version: 'detect', // 설치된 React 버전 자동 감지
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
