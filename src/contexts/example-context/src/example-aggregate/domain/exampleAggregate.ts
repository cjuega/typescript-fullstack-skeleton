import AggregateRoot from '@context/shared/domain/aggregateRoot';
import Datetime from '@context/shared/domain/datetime';
import type { Primitives } from '@context/shared/domain/primitives';
import ExampleAggregateCreatedDomainEvent from '@src/example-aggregate/domain/exampleAggregateCreatedDomainEvent';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';

export default class ExampleAggregate extends AggregateRoot {
    readonly id: ExampleAggregateId;

    readonly createdAt: Datetime;

    private constructor(id: ExampleAggregateId, createdAt: Datetime) {
        super();

        this.id = id;
        this.createdAt = createdAt;
    }

    static create(id: string, createdAt: Datetime): ExampleAggregate {
        const aggregate = new ExampleAggregate(new ExampleAggregateId(id), createdAt);

        aggregate.record(new ExampleAggregateCreatedDomainEvent(aggregate.toPrimitives()));

        return aggregate;
    }

    static fromPrimitives({ id, createdAt }: Primitives<ExampleAggregate>): ExampleAggregate {
        return new ExampleAggregate(new ExampleAggregateId(id), new Datetime(createdAt));
    }

    toPrimitives(): Primitives<ExampleAggregate> {
        return {
            id: this.id.value,
            createdAt: this.createdAt.value
        };
    }
}
