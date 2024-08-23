import { ExampleAggregate } from "@src/example-aggregate/domain/exampleAggregate";
import { ExampleAggregateRepository } from "@src/example-aggregate/domain/exampleAggregateRepository";

export class InMemoryExampleAggregateRepository implements ExampleAggregateRepository {
    async findAll(): Promise<ExampleAggregate[]> {
        return [];
    }
}