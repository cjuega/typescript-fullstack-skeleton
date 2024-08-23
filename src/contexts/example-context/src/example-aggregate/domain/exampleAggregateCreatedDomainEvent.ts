import DomainEvent from '@context/shared/domain/eventBus/domainEvent';
import type { Primitives } from '@context/shared/domain/primitives';
import type ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';

type CreateExampleAggregateDomainEventBody = Readonly<Omit<Primitives<ExampleAggregate>, 'id'>>;

export default class ExampleAggregateCreatedDomainEvent extends DomainEvent {
    static readonly eventName = 'company.service.event.exampleAggregate.created.1';

    readonly body: CreateExampleAggregateDomainEventBody;

    constructor(
        args: Primitives<ExampleAggregate> & {
            eventId?: string;
            occurredOn?: Date;
        }
    ) {
        const { id, eventId, occurredOn, ...body } = args;

        super(ExampleAggregateCreatedDomainEvent.eventName, id, eventId, occurredOn);

        this.body = body;
    }

    toPrimitives(): CreateExampleAggregateDomainEventBody {
        return this.body;
    }

    static fromPrimitives(
        aggregateId: string,
        body: CreateExampleAggregateDomainEventBody,
        eventId: string,
        occurredOn: Date
    ): DomainEvent {
        return new ExampleAggregateCreatedDomainEvent({
            ...body,
            id: aggregateId,
            eventId,
            occurredOn
        });
    }
}
