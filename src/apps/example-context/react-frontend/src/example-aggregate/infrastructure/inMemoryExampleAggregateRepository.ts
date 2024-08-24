import type { ExampleAggregate } from '@src/example-aggregate/domain/exampleAggregate';
import type { ExampleAggregateRepository } from '@src/example-aggregate/domain/exampleAggregateRepository';

export class InMemoryExampleAggregateRepository implements ExampleAggregateRepository {
    findAll(): Promise<ExampleAggregate[]> {
        return Promise.resolve([]);
    }
}
