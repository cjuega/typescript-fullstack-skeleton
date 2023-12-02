import Uuid from '@src/domain/uuid';

export default abstract class DomainEvent {
    readonly eventId: string;

    readonly aggregateId: string;

    readonly occurredOn: Date;

    readonly eventName: string;

    constructor(eventName: string, aggregateId: string, eventId?: string, occurredOn?: Date) {
        this.aggregateId = aggregateId;
        this.eventId = eventId || Uuid.random().value;
        this.occurredOn = occurredOn || new Date();
        this.eventName = eventName;
    }

    abstract toPrimitives(): unknown;
}
