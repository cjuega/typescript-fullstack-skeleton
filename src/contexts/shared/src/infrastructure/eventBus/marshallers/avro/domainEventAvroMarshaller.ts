import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import type { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import type { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import type DomainEventAvroMapping from '@src/infrastructure/eventBus/marshallers/avro/domainEventAvroMapping';

type JsonApi = {
    data: {
        id: string;
        type: string;
        occurredOn: string;
        attributes: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
};

export default class DomainEventAvroMarshaller implements DomainEventMarshaller, DomainEventUnmarshaller {
    private readonly mapping: DomainEventMapping;

    private readonly avroMapping: DomainEventAvroMapping;

    constructor(mapping: DomainEventMapping, avroMapping: DomainEventAvroMapping) {
        this.mapping = mapping;
        this.avroMapping = avroMapping;
    }

    marshall(e: DomainEvent): Buffer {
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

        return this.avroMapping.for(e.eventName).toBuffer(jsonApi);
    }

    unmarshall(infraEventBuf: Buffer): DomainEvent {
        const jsonApi = this.avroMapping.fromBuffer(infraEventBuf) as JsonApi,
            eventData = jsonApi.data,
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
