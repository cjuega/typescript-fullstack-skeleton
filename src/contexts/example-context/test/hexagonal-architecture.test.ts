import 'tsarch/dist/jest';
import { FileConditionBuilder, filesOfProject } from 'tsarch';
import { readdir } from 'fs';
import { promisify } from 'util';

const TEST_TIMEOUT_IN_MILLISECONDS = 60 * 1000;

describe('hexagonal architecture', () => {
    let files: FileConditionBuilder;

    // eslint-disable-next-line jest/no-hooks
    beforeAll(() => {
        files = filesOfProject(`${__dirname}/../tsconfig.json`);
    });

    describe('shared module', () => {
        it('shouldn\'t depend on any other module', async () => {
            expect.hasAssertions();

            const rule = files
                .inFolder('shared')
                .shouldNot()
                .dependOnFiles()
                .matchingPattern('^(?!.*shared).*');

            await expect(rule).toPassAsync();
        });
    });

    describe('other modules', () => {
        const readdirAsync = promisify(readdir);
        let modules: string[];

        // eslint-disable-next-line jest/no-hooks
        beforeAll(async () => {
            modules = (await readdirAsync(`${__dirname}/../src`, { withFileTypes: true }))
                .filter((d) => d.isDirectory())
                .map(({ name }) => name)
                .filter((m) => m !== 'shared');
        });

        it('should only depend on Commands, Queries or Events from other modules', async () => {
            expect.hasAssertions();

            for (const module of modules) {
                const rule = files
                    .inFolder(module)
                    .shouldNot()
                    .dependOnFiles()
                    // All files in other modules (except shared) that don't finish with Command, Query or DomainEvent
                    .matchingPattern(`^(?!.*\\/(${module}|shared)\\/.*)(?!.+(Command|Query|DomainEvent)\\.ts$).*$`);

                // eslint-disable-next-line no-await-in-loop
                await expect(rule).toPassAsync();
            }
        });
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
