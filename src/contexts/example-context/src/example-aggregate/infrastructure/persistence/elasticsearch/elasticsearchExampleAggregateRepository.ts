import type { Nullable } from '@context/shared/domain/nullable';
import ElasticsearchRepository from '@context/shared/infrastructure/persistence/elasticsearch/elasticsearchRepository';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import type ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';

export default class ElasticsearchExampleAggregateRepository
    extends ElasticsearchRepository<ExampleAggregate>
    implements ExampleAggregateRepository
{
    protected moduleName() {
        return 'example-aggregates';
    }

    async save(exampleAggregate: ExampleAggregate): Promise<void> {
        await this.persist(exampleAggregate.id.value, exampleAggregate);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        const aggregate = await this.byId(id.value, ExampleAggregate.fromPrimitives);
        return aggregate;
    }
}
