import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import { Nullable } from '@context/shared/domain/nullable';

export interface ExampleAggregateRepository {
    save(aggregate: ExampleAggregate): Promise<void>;

    search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>>;
}
