import NoopLogger from '@context/shared/infrastructure/logger/noopLogger';
import MongoClientFactory from '@context/shared/infrastructure/persistence/mongo/mongoClientFactory';
import MongoEnvironmentArranger from '@context/shared/infrastructure/persistence/mongo/mongoEnvironmentArranger';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import MongoExampleAggregateRepository from '@src/example-aggregate/infrastructure/persistence/mongo/mongoExampleAggregateRepository';

const noLogger = new NoopLogger(),
    client = MongoClientFactory.createClient(
        'integration-tests',
        {
            url: 'mongodb://localhost:27017',
            username: 'root',
            password: 'integration-test'
        },
        noLogger
    ),
    environmentArranger = new MongoEnvironmentArranger(client),
    repository = new MongoExampleAggregateRepository(client);

describe('mongoExampleAggregateRepository', () => {
    // eslint-disable-next-line jest/no-hooks
    beforeEach(async () => {
        await environmentArranger.arrange();
    });

    // eslint-disable-next-line jest/no-hooks
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
