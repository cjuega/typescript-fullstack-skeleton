// eslint-disable-next-line @typescript-eslint/no-var-requires
const globalJest = require('./jest.config'),
    TEST_TIMEOUT = 20 * 1000;

delete globalJest.testPathIgnorePatterns;

module.exports = {
    ...globalJest,
    testTimeout: TEST_TIMEOUT,
    testMatch: ['**/persistence/**/*.test.ts']
};
