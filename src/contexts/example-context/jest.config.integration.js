// eslint-disable-next-line @typescript-eslint/no-var-requires
const globalJest = require('./jest.config.json'),
    TEST_TIMEOUT = 20 * 1000;

delete globalJest.testPathIgnorePatterns;

module.exports = {
    ...globalJest,
    testTimeout: TEST_TIMEOUT,
    testMatch: ['<rootDir>/src/**/persistence/**/*.test.ts']
};
