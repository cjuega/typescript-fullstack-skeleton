// eslint-disable-next-line max-len
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import RedisExampleAggregateRepository from '@src/example-aggregate/infrastructure/persistence/redis/redisExampleAggregateRepository';
import RedisClientFactory from '@context/shared/infrastructure/persistence/redis/redisClientFactory';
import RedisEnvironmentArranger from '@context/shared/infrastructure/persistence/redis/redisEnvironmentArranger';

const client = RedisClientFactory.createClient(
        'integration-tests',
        {
            endpoints: ['redis://localhost:6379'],
            clusterModeEnabled: false
        }
    ),
    environmentArranger = new RedisEnvironmentArranger(client),
    repository = new RedisExampleAggregateRepository(client);

describe('redisExampleAggregateRepository', () => {
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

            expect(await repository.search(ExampleAggregateIdMother.create(expected.id))).toStrictEqual(expected);
        });
    });
});
