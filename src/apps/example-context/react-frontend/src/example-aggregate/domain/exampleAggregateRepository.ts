import { ExampleAggregate } from "@src/example-aggregate/domain/exampleAggregate";

export interface ExampleAggregateRepository {
    findAll(): Promise<ExampleAggregate[]>;
}