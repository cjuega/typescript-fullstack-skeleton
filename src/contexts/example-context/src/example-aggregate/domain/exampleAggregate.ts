import { Primitives } from '@context/shared/domain/primitives';
import AggregateRoot from '@context/shared/domain/aggregateRoot';
import ExampleAggregateId from '@src/example-aggregate/domain/exampleAggregateId';
import Datetime from '@context/shared/domain/datetime';
// eslint-disable-next-line import/no-cycle
import ExampleAggregateCreatedDomainEvent from '@src/example-aggregate/domain/exampleAggregateCreatedDomainEvent';

export default class ExampleAggregate extends AggregateRoot {
    private readonly _id: ExampleAggregateId;

    private readonly _createdAt: Datetime;

    get id(): string {
        return this._id.value;
    }

    get createdAt(): string {
        return this._createdAt.value;
    }

    constructor({ id, createdAt }: Primitives<ExampleAggregate>) {
        super();

        this._id = new ExampleAggregateId(id);
        this._createdAt = new Datetime(createdAt);
    }

    static create(id: string, createdAt: Datetime): ExampleAggregate {
        const aggregate = new ExampleAggregate({ id, createdAt: createdAt.value });

        aggregate.record(new ExampleAggregateCreatedDomainEvent(aggregate.toPrimitives()));

        return aggregate;
    }

    toPrimitives(): Primitives<ExampleAggregate> {
        return {
            id: this._id.value,
            createdAt: this._createdAt.value
        };
    }
}
