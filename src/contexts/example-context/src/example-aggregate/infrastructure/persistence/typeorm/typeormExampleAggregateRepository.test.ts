import { resolve } from 'node:path';
import NoopLogger from '@context/shared/infrastructure/logger/noopLogger';
import TypeormClientFactory from '@context/shared/infrastructure/persistence/typeorm/typeormClientFactory';
import TypeormEnvironmentArranger from '@context/shared/infrastructure/persistence/typeorm/typeormEnvironmentArranger';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import TypeormExampleAggregateRepository from '@src/example-aggregate/infrastructure/persistence/typeorm/typeormExampleAggregateRepository';

const noLogger = new NoopLogger(),
    table = TypeormClientFactory.createClient(
        'integration-tests',
        {
            host: 'localhost',
            port: 3307,
            username: 'root',
            password: 'integration-test',
            database: 'database',
            entities: [resolve(__dirname, '../../../../', '**/typeorm/*.entity.ts')],
            migrations: [resolve(__dirname, '../../../../../', 'db/migrations/mysql/*')]
        },
        noLogger
    ),
    environmentArranger = new TypeormEnvironmentArranger(table),
    repository = new TypeormExampleAggregateRepository(table);

describe('typeormExampleAggregateRepository', () => {
    beforeEach(async () => {
        await environmentArranger.arrange();
    });

    afterAll(async () => {
        await environmentArranger.close();
    });

    describe('save', () => {
        it('should save an ExampleAggregate', async () => {
            expect.hasAssertions();

            const aggregate = ExampleAggregateMother.random();

            await repository.save(aggregate);

            expect(true).toBe(true);
        });
    });

    describe('search', () => {
        it("should return null when ExampleAggregate doesn't exist", async () => {
            expect.hasAssertions();

            expect(await repository.search(ExampleAggregateIdMother.random())).toBeNull();
        });

        it('should return an existing ExampleAggregate', async () => {
            expect.hasAssertions();

            const expected = ExampleAggregateMother.random();

            await repository.save(expected);

            expect(await repository.search(expected.id)).toStrictEqual(expected);
        });
    });
});
