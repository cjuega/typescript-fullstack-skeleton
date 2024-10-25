import { InMemoryExampleAggregateRepository } from '@src/example-aggregate/infrastructure/inMemoryExampleAggregateRepository';
import { ExampleAggregateList } from '@src/example-aggregate/sections/list/exampleAggregateList';

const repository = new InMemoryExampleAggregateRepository();

export function ExampleAggregateListFactory() {
    return <ExampleAggregateList repository={repository} />;
}
