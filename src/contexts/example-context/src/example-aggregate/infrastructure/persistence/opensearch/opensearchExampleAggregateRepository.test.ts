import NoopLogger from '@context/shared/infrastructure/logger/noopLogger';
import OpensearchClientFactory from '@context/shared/infrastructure/persistence/opensearch/opensearchClientFactory';
import OpensearchEnvironmentArranger from '@context/shared/infrastructure/persistence/opensearch/opensearchEnvironmentArranger';
import OpensearchIndexCreator from '@context/shared/infrastructure/persistence/opensearch/opensearchIndexCreator';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import OpensearchExampleAggregateRepository from '@src/example-aggregate/infrastructure/persistence/opensearch/opensearchExampleAggregateRepository';

const noLogger = new NoopLogger(),
    config = {
        url: 'http://localhost:9201',
        indices: 'src/**/opensearch/*.mapping.json'
    },
    client = OpensearchClientFactory.createClient('integration-tests', config, noLogger),
    indicesCreator = new OpensearchIndexCreator(client, config),
    environmentArranger = new OpensearchEnvironmentArranger(client, indicesCreator),
    repository = new OpensearchExampleAggregateRepository(client);

describe('opensearchExampleAggregateRepository', () => {
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
