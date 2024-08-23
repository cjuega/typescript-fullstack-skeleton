import { ExampleAggregateRepository } from "@src/example-aggregate/domain/exampleAggregateRepository";
import { ExampleAggregateItem } from "@src/example-aggregate/sections/list/exampleAggregateItem";
import { useExampleAggregates } from "@src/example-aggregate/sections/list/useExampleAggregates";

interface ExampleAggregateListProps {
    repository: ExampleAggregateRepository;
}

export function ExampleAggregateList({ repository }: ExampleAggregateListProps) {
    const exampleAggregates = useExampleAggregates(repository),
        noResults = exampleAggregates.length === 0;

    return (
        <>
            <header>
                <h1>Example Aggregate List</h1>
            </header>
            <section>
                {noResults ?
                    <p>There aren't example aggregates</p> :
                    exampleAggregates.map((exampleAggregate) => <ExampleAggregateItem key={exampleAggregate.id} item={exampleAggregate} />)}
            </section>
        </>
    );
}