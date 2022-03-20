import AggregateRoot from '@context/shared/domain/aggregateRoot';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import Datetime from '@context/shared/domain/datetime';
import { ExampleAggregatePrimitives } from '@src/example-aggregate/domain/exampleAggregatePrimitives';
import ExampleAggregateCreatedDomainEvent from '@src/example-aggregate/domain/exampleAggregateCreatedDomainEvent';

export default class ExampleAggregate extends AggregateRoot {
    readonly id: ExampleAggregateId;

    readonly createdAt: Datetime;

    constructor(id: ExampleAggregateId, createdAt: Datetime) {
        super();

        this.id = id;
        this.createdAt = createdAt;
    }

    static create(id: ExampleAggregateId, createdAt: Datetime): ExampleAggregate {
        const aggregate = new ExampleAggregate(id, createdAt);

        aggregate.record(new ExampleAggregateCreatedDomainEvent(aggregate.toPrimitives()));

        return aggregate;
    }

    static fromPrimitives({ id, createdAt }: ExampleAggregatePrimitives): ExampleAggregate {
        return new ExampleAggregate(new ExampleAggregateId(id), new Datetime(createdAt));
    }

    toPrimitives(): ExampleAggregatePrimitives {
        return {
            id: this.id.value,
            createdAt: this.createdAt.value
        };
    }
}
