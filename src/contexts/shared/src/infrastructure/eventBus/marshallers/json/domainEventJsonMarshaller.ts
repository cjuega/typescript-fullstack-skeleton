import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import type { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import type { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';

type JsonApi = {
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

    marshall(e: DomainEvent): string {
        const jsonApi: JsonApi = {
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

        return JSON.stringify(jsonApi);
    }

    unmarshall(infraEventStr: string | Buffer): DomainEvent {
        const infraEvent = JSON.parse(Buffer.isBuffer(infraEventStr) ? infraEventStr.toString() : infraEventStr) as JsonApi,
            eventData = infraEvent.data,
            eventName = eventData.type,
            eventCtor = this.mapping.for(eventName);

        if (!eventCtor) {
            throw new Error(`The event ${eventName} doesn't exist or has no subscribers`);
        }

        return new eventCtor({
            ...eventData.attributes,
            eventId: eventData.id,
            occurredOn: new Date(eventData.occurredOn)
        });
    }
}
