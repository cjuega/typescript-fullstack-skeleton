import 'tsarch/dist/jest';
import { FileConditionBuilder, filesOfProject } from 'tsarch';

const TEST_TIMEOUT_IN_MILLISECONDS = 60 * 1000;

describe('hexagonal architecture', () => {
    let files: FileConditionBuilder;

    // eslint-disable-next-line jest/no-hooks
    beforeAll(() => {
        files = filesOfProject(`${__dirname}/../tsconfig.json`);
    });

    it('domain code shouldn\'t depend on application code', async () => {
        expect.hasAssertions();

        const rule = files
            .inFolder('domain')
            .shouldNot()
            .dependOnFiles()
            .inFolder('application');

        await expect(rule).toPassAsync();
    }, TEST_TIMEOUT_IN_MILLISECONDS);

    it('domain code shouldn\'t depend on infrastructure code', async () => {
        expect.hasAssertions();

        const rule = files
            .inFolder('domain')
            .shouldNot()
            .dependOnFiles()
            .inFolder('infrastructure');

        await expect(rule).toPassAsync();
    }, TEST_TIMEOUT_IN_MILLISECONDS);

    it('application code shouldn\'t depend on infrastructure code', async () => {
        expect.hasAssertions();

        const rule = files
            .inFolder('application')
            .shouldNot()
            .dependOnFiles()
            .inFolder('infrastructure');

        await expect(rule).toPassAsync();
    }, TEST_TIMEOUT_IN_MILLISECONDS);

    it('production code shouldn\'t depend on test files (mocks and mothers)', async () => {
        expect.hasAssertions();

        const rule = files
            // all files not having test, mock or mother in their name
            .matchingPattern('^[^.]+(?!\\.(test|mock|mother))\\.ts')
            .shouldNot()
            .dependOnFiles()
            .matchingPattern('\\.(mock|mother)\\.ts');

        await expect(rule).toPassAsync();
    }, TEST_TIMEOUT_IN_MILLISECONDS);

    it('there shouldn\'t be cycles in code references', async () => {
        expect.hasAssertions();

        const rule = files
            .inFolder('src')
            .should()
            .beFreeOfCycles();

        await expect(rule).toPassAsync();
    }, TEST_TIMEOUT_IN_MILLISECONDS);
});
