import NoopLogger from '@context/shared/infrastructure/logger/noopLogger';
import DdbOneTableClientFactory from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableClientFactory';
import DdbOneTableEnvironmentArranger from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableEnvironmentArranger';
import DynamodbClientFactory from '@context/shared/infrastructure/persistence/dynamodb/dynamodbClientFactory';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import DdbOneTableExampleAggregateRepository from '@src/example-aggregate/infrastructure/persistence/ddbOneTable/ddbOneTableExampleAggregateRepository';

const noLogger = new NoopLogger(),
    table = DdbOneTableClientFactory.createClient(
        'integration-tests',
        DynamodbClientFactory.createClient(
            'integration-tests',
            {
                region: 'localhost',
                endpoint: 'http://localhost:8000',
                sslEnabled: false
            },
            noLogger
        ),
        {
            tableName: 'db-integration-tests',
            indexes: { primary: { hash: 'pk', sort: 'sk' } }
        },
        noLogger
    ),
    environmentArranger = new DdbOneTableEnvironmentArranger(table),
    repository = new DdbOneTableExampleAggregateRepository(table);

describe('ddbOneTableExampleAggregateRepository', () => {
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
