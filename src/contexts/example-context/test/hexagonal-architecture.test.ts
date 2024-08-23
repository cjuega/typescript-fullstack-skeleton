import 'tsarch/dist/jest';
import { readdir } from 'node:fs';
import { promisify } from 'node:util';
import { type FileConditionBuilder, filesOfProject } from 'tsarch';

const TEST_TIMEOUT_IN_MILLISECONDS = 60 * 1000;

describe('hexagonal architecture', () => {
    let files: FileConditionBuilder;

    beforeAll(() => {
        files = filesOfProject(`${__dirname}/../tsconfig.json`);
    });

    describe('shared module', () => {
        it("shouldn't depend on any other module", () => {
            expect.hasAssertions();

            const rule = files.inFolder('shared').shouldNot().dependOnFiles().matchingPattern('^(?!.*shared).*');

            expect(rule).toPassAsync();
        });
    });

    describe('other modules', () => {
        const readdirAsync = promisify(readdir);
        let modules: string[];

        beforeAll(async () => {
            modules = (await readdirAsync(`${__dirname}/../src`, { withFileTypes: true }))
                .filter((d) => d.isDirectory())
                .map(({ name }) => name)
                .filter((m) => m !== 'shared');
        });

        it('should only depend on Commands, Queries or Events from other modules', () => {
            expect.hasAssertions();

            for (const module of modules) {
                const rule = files
                    .inFolder(module)
                    .shouldNot()
                    .dependOnFiles()
                    // All files in other modules (except shared) that don't finish with Command, Query or DomainEvent
                    .matchingPattern(`^(?!.*\\/(${module}|shared)\\/.*)(?!.+(Command|Query|DomainEvent)\\.ts$).*$`);

                expect(rule).toPassAsync();
            }
        });
    });

    it(
        "domain code shouldn't depend on application code",
        () => {
            expect.hasAssertions();

            const rule = files.inFolder('domain').shouldNot().dependOnFiles().inFolder('application');

            expect(rule).toPassAsync();
        },
        TEST_TIMEOUT_IN_MILLISECONDS
    );

    it(
        "domain code shouldn't depend on infrastructure code",
        () => {
            expect.hasAssertions();

            const rule = files.inFolder('domain').shouldNot().dependOnFiles().inFolder('infrastructure');

            expect(rule).toPassAsync();
        },
        TEST_TIMEOUT_IN_MILLISECONDS
    );

    it(
        "application code shouldn't depend on infrastructure code",
        () => {
            expect.hasAssertions();

            const rule = files.inFolder('application').shouldNot().dependOnFiles().inFolder('infrastructure');

            expect(rule).toPassAsync();
        },
        TEST_TIMEOUT_IN_MILLISECONDS
    );

    it(
        "production code shouldn't depend on test files (mocks and mothers)",
        () => {
            expect.hasAssertions();

            const rule = files
                // all files not having test, mock or mother in their name
                .matchingPattern('^[^.]+(?!\\.(test|mock|mother))\\.ts')
                .shouldNot()
                .dependOnFiles()
                .matchingPattern('\\.(mock|mother)\\.ts');

            expect(rule).toPassAsync();
        },
        TEST_TIMEOUT_IN_MILLISECONDS
    );

    it(
        "there shouldn't be cycles in code references",
        () => {
            expect.hasAssertions();

            const rule = files.inFolder('src').should().beFreeOfCycles();

            expect(rule).toPassAsync();
        },
        TEST_TIMEOUT_IN_MILLISECONDS
    );
});
