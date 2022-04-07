import { DomainEvent } from '@context/shared/domain/eventBus/domainEvent';
import { ExampleAggregatePrimitives } from '@src/example-aggregate/domain/exampleAggregatePrimitives';

type CreateExampleAggregateDomainEventBody = Readonly<Omit<ExampleAggregatePrimitives, 'id'>>;

export default class ExampleAggregateCreatedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'company.service.1.event.exampleAggregate.created';

    readonly body: CreateExampleAggregateDomainEventBody;

    constructor(args: ExampleAggregatePrimitives & {
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
