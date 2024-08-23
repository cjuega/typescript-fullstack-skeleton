import NoopLogger from '@context/shared/infrastructure/logger/noopLogger';
import ElasticsearchClientFactory from '@context/shared/infrastructure/persistence/elasticsearch/elasticsearchClientFactory';
import ElasticsearchEnvironmentArranger from '@context/shared/infrastructure/persistence/elasticsearch/elasticsearchEnvironmentArranger';
import ElasticsearchIndexCreator from '@context/shared/infrastructure/persistence/elasticsearch/elasticsearchIndexCreator';
import ExampleAggregateMother from '@src/example-aggregate/domain/exampleAggregate.mother';
import ExampleAggregateIdMother from '@src/example-aggregate/domain/exampleAggregateId.mother';
import ElasticsearchExampleAggregateRepository from '@src/example-aggregate/infrastructure/persistence/elasticsearch/elasticsearchExampleAggregateRepository';
import { resolve } from 'path';

const noLogger = new NoopLogger(),
    config = {
        url: 'https://localhost:9200',
        username: 'elastic',
        password: 'integration-test',
        caCertificate: resolve(__dirname, '../../../../../../../../', '.data/elastic-certs/ca/ca.crt'),
        indices: 'src/**/elasticsearch/*.mapping.json'
    },
    client = ElasticsearchClientFactory.createClient('integration-tests', config, noLogger),
    indicesCreator = new ElasticsearchIndexCreator(client, config),
    environmentArranger = new ElasticsearchEnvironmentArranger(client, indicesCreator),
    repository = new ElasticsearchExampleAggregateRepository(client);

describe('elasticsearchExampleAggregateRepository', () => {
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
