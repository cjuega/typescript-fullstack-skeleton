import ExampleAggregateCreatedDomainEvent from '@src/example-aggregate/domain/exampleAggregateCreatedDomainEvent';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';
import { Primitives } from '@context/shared/domain/primitives';

export default class ExampleAggregateCreatedDomainEventMother {
    static create(
        params: Primitives<ExampleAggregate> & {
            eventId?: string;
            occurredOn?: Date;
        }
    ) {
        return new ExampleAggregateCreatedDomainEvent(params);
    }

    static fromExampleAggregate(aggregate: ExampleAggregate): ExampleAggregateCreatedDomainEvent {
        return ExampleAggregateCreatedDomainEventMother.create(aggregate.toPrimitives());
    }
}
