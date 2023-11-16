import { DomainEvent } from '@context/shared/domain/eventBus/domainEvent';
import { Primitives } from '@context/shared/domain/primitives';
import ExampleAggregate from '@src/example-aggregate/domain/exampleAggregate';

type CreateExampleAggregateDomainEventBody = Readonly<Omit<Primitives<ExampleAggregate>, 'id'>>;

export default class ExampleAggregateCreatedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'company.service.1.event.exampleAggregate.created';

    readonly body: CreateExampleAggregateDomainEventBody;

    constructor(args: Primitives<ExampleAggregate> & {
        eventId?: string;
        occurredOn?: Date;
    }) {
        const {
            id, eventId, occurredOn, ...body
        } = args;

        super(ExampleAggregateCreatedDomainEvent.EVENT_NAME, id, eventId, occurredOn);

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
