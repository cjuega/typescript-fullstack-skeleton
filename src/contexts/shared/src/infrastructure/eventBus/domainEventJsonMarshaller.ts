import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';

export type JsonApi = {
    data: {
        id: string;
        type: string;
        occurredOn: string;
        attributes: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
};

export default class DomainEventJsonMarshaller implements DomainEventMarshaller, DomainEventUnmarshaller {
    private readonly mapping: DomainEventMapping;

    constructor(mapping: DomainEventMapping) {
        this.mapping = mapping;
    }

    // eslint-disable-next-line class-methods-use-this
    marshall(e: DomainEvent): JsonApi {
        return {
            data: {
                id: e.eventId,
                type: e.eventName,
                occurredOn: e.occurredOn.toISOString(),
                attributes: {
                    id: e.aggregateId,
                    ...(e.toPrimitives() as Record<string, unknown>)
                },
                meta: {}
            }
        };
    }

    unmarshall(infraEvent: JsonApi): DomainEvent {
        const eventData = infraEvent.data,
            eventName = eventData.type,
            eventCtor = this.mapping.for(eventName);

        if (!eventCtor) {
            throw new Error(`The event ${eventName} doesn't exist or has no subscribers`);
        }

        // eslint-disable-next-line new-cap
        return new eventCtor({
            ...eventData.attributes,
            eventId: eventData.id,
            occurredOn: new Date(eventData.occurredOn)
        });
    }
}
