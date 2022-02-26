/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest/utils'),
    { compilerOptions } = require('./tsconfig.build.json');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    cacheDirectory: '.tmp/jestCache',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    coverageDirectory: './reports/coverage',
    coverageReporters: ['lcov', 'text-summary'],
    collectCoverageFrom: ['**/*.{ts}', '!**/node_modules/**', '!**/*.test.{ts}', '!**/*.mock.{ts}', '!**/*.mother.{ts}'],
    coverageThreshold: {
        global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95
        }
    },
    testPathIgnorePatterns: ['<rootDir>/(.*)/persistence/(.*)'],
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.build.json'
        }
    }
};
