import DynamodbClientFactory from '@context/shared/infrastructure/persistence/dynamodb/dynamodbClientFactory';
import DdbOneTableClientFactory from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableClientFactory';
import DdbOneTableEnvironmentArranger from '@context/shared/infrastructure/persistence/ddbOneTable/ddbOneTableEnvironmentArranger';
// eslint-disable-next-line max-len
import DdbOneTableExampleAggregateRepository from '@src/example-aggregate/infrastructure/persistence/ddbOneTable/ddbOneTableExampleAggregateRepository';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';

const table = DdbOneTableClientFactory.createClient(
        'integration-tests',
        DynamodbClientFactory.createClient('integration-tests', {
            region: 'localhost',
            endpoint: 'http://localhost:8000',
            sslEnabled: false
        }),
        {
            tableName: 'db-integration-tests',
            indexes: { primary: { hash: 'pk', sort: 'sk' } },
            logger: true
        }
    ),
    environmentArranger = new DdbOneTableEnvironmentArranger(table),
    repository = new DdbOneTableExampleAggregateRepository(table);

describe('ddbOneTableExampleAggregateRepository', () => {
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
