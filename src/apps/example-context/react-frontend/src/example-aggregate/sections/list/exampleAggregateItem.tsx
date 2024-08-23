import { ExampleAggregate } from "@src/example-aggregate/domain/exampleAggregate";

interface ExampleAggregateItemProps {
    item: ExampleAggregate;
}

export function ExampleAggregateItem({ item }: ExampleAggregateItemProps) {
    return (
        <article>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
        </article>
    );
}