import type { Nullable } from '@context/shared/domain/nullable';
import type ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import type ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';

export interface ExampleAggregateRepository {
    save(aggregate: ExampleAggregate): Promise<void>;

    search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>>;
}
