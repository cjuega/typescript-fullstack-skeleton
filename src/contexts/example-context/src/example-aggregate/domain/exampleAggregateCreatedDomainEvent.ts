import { DomainEvent } from '@context/shared/domain/eventBus/domainEvent';
import { ExampleAggregatePrimitives } from '@src/example-aggregate/domain/exampleAggregatePrimitives';

type CreateExampleAggregateDomainEventBody = Readonly<Omit<ExampleAggregatePrimitives, 'id'>>;

export default class ExampleAggregateCreatedDomainEvent extends DomainEvent {
    static readonly EVENT_NAME = 'company.service.1.event.exampleAggregate.created';

    readonly createdAt: string;

    constructor({
        id,
        createdAt,
        eventId,
        occurredOn
    }: ExampleAggregatePrimitives & {
        eventId?: string;
        occurredOn?: Date;
    }) {
        super(ExampleAggregateCreatedDomainEvent.EVENT_NAME, id, eventId, occurredOn);

        this.createdAt = createdAt;
    }

    toPrimitives(): CreateExampleAggregateDomainEventBody {
        const { createdAt } = this;

        return {
            createdAt
        };
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
