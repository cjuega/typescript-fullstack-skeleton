const globalJest = require('./jest.config.json'),
    TEST_TIMEOUT = 20 * 1000;

delete globalJest.testPathIgnorePatterns;

module.exports = {
    ...globalJest,
    testTimeout: TEST_TIMEOUT,
    testMatch: ['<rootDir>/src/**/infrastructure/**/*.test.ts'],
};
