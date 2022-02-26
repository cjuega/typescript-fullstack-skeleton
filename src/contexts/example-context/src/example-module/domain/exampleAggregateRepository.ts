import ExampleAggregate from '@src/example-module/domain/exampleAggregate';
import ExampleAggregateId from '@src/example-module/domain/exampleAggregateId';
import { Nullable } from '@context/shared/domain/nullable';

export interface ExampleAggregateRepository {
    save(aggregate: ExampleAggregate): Promise<void>;

    search(id: ExampleAggregateId): Promise<Nullable<ExampleAggregate>>;
}
