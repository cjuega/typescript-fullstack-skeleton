import AggregateRoot from '@context/shared/domain/aggregateRoot';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import Datetime from '@context/shared/domain/datetime';
import { ExampleAggregatePrimitives } from '@src/example-aggregate/domain/exampleAggregatePrimitives';
import ExampleAggregateCreatedDomainEvent from '@src/example-aggregate/domain/exampleAggregateCreatedDomainEvent';

export default class ExampleAggregate extends AggregateRoot {
    private readonly _id: ExampleAggregateId;

    private readonly createdAt: Datetime;

    get id(): string {
        return this._id.value;
    }

    constructor(id: string, createdAt: Datetime) {
        super();

        this._id = new ExampleAggregateId(id);
        this.createdAt = createdAt;
    }

    static create(id: string, createdAt: Datetime): ExampleAggregate {
        const aggregate = new ExampleAggregate(id, createdAt);

        aggregate.record(new ExampleAggregateCreatedDomainEvent(aggregate.toPrimitives()));

        return aggregate;
    }

    static fromPrimitives({ id, createdAt }: ExampleAggregatePrimitives): ExampleAggregate {
        return new ExampleAggregate(id, new Datetime(createdAt));
    }

    toPrimitives(): ExampleAggregatePrimitives {
        return {
            id: this._id.value,
            createdAt: this.createdAt.value
        };
    }
}
