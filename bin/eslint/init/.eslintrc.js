module.exports = {
    ignorePatterns: [
        'node_modules',
        'client/web/static/libs',
        'docs',
        'extra',
        'test'
    ],
    rules: {
    },
    overrides: [{
        /* Config for node files */
        files: '**/*.js',
        excludedFiles: '**/react/*.js',
        env: {
            commonjs: true,
            es6: true
        },
        extends: [
            'standard'
        ],
        globals: {
            Atomics: 'readonly',
            SharedArrayBuffer: 'readonly',
            mitownRequire: 'readonly',
            system: 'readonly'
        },
        parserOptions: {
            ecmaVersion: 2018
        },
        rules: {
            semi: ['error', 'always'],
            indent: ['error', 4],
            'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }]
        }
    },
    {
        /* Config for react files */
        files: '**/*.jsx',
        env: {
            browser: true
        },
        extends: [
            'standard',
            'plugin:react/recommended'
        ],

        globals: {
            $: 'readonly'
        },
        plugins: ['react'],
        parser: '@babel/eslint-parser',
        parserOptions: {
            ecmaVersion: 2018,
            ecmaFeatures: {
                jsx: true
            }
        },
        settings: {
            react: {
                version: '16.13'
            }
        },
        rules: {
            semi: ['error', 'always'],
            indent: ['error', 4],
            'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],

            'no-unused-vars': ['error', { vars: 'local', varsIgnorePattern: '^[A-Z].+$' }]
        }
    }]
};
