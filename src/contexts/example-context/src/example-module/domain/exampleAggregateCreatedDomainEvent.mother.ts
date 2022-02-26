import { ExampleAggregatePrimitives } from '@src/example-module/domain/exampleAggregatePrimitives';
import ExampleAggregateCreatedDomainEvent from '@src/example-module/domain/exampleAggregateCreatedDomainEvent';
import ExampleAggregate from '@src/example-module/domain/exampleAggregate';

export default class ExampleAggregateCreatedDomainEventMother {
    static create(
        params: ExampleAggregatePrimitives & {
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
