import { Nullable } from '@context/shared/domain/nullable';
import ExampleAggregate from '@src/example-module/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-module/domain/exampleAggregateId';
import { ExampleAggregateRepository } from '@src/example-module/domain/exampleAggregateRepository';

export default class InMemoryExampleAggregateRepository implements ExampleAggregateRepository {
    private readonly memory: Map<string, ExampleAggregate>;

    constructor() {
        this.memory = new Map<string, ExampleAggregate>();
    }

    async save(aggregate: ExampleAggregate): Promise<void> {
        this.memory.set(aggregate.id.value, aggregate);
    }

    async search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>> {
        return this.memory.get(id.value) || null;
    }
}
