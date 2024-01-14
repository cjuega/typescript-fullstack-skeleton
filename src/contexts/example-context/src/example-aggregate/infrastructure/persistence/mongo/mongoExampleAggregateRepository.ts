import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import MongoRepository from '@context/shared/infrastructure/persistence/mongo/mongoRepository';
import { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import { Nullable } from '@context/shared/domain/nullable';

export default class MongoExampleAggregateRepository extends MongoRepository<ExampleAggregate> implements ExampleAggregateRepository {
    // eslint-disable-next-line class-methods-use-this
    protected moduleName() {
        return 'example-aggregates';
    }

    async save(exampleAggregate: ExampleAggregate): Promise<void> {
        await this.persist(exampleAggregate.id.value, exampleAggregate);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        return this.byId(id.value, ExampleAggregate.fromPrimitives);
    }
}
