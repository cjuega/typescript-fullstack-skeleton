import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventMarshaller } from '@src/domain/eventBus/domainEventMarshaller';
import { DomainEventUnmarshaller } from '@src/domain/eventBus/domainEventUnmarshaller';
import DomainEventMapping from '@src/domain/eventBus/domainEventMapping';
import DomainEventProtobufMapping from '@src/infrastructure/eventBus/marshallers/protobuf/domainEventProtobufMapping';

type JsonApi = {
    data: {
        id: string;
        type: string;
        occurredOn: string;
        attributes: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
};

export default class DomainEventProtobufMarshaller implements DomainEventMarshaller, DomainEventUnmarshaller {
    private readonly mapping: DomainEventMapping;

    private readonly protobufMapping: DomainEventProtobufMapping;

    constructor(mapping: DomainEventMapping, protobufMapping: DomainEventProtobufMapping) {
        this.mapping = mapping;
        this.protobufMapping = protobufMapping;
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
        },
            type = this.protobufMapping.for(e.eventName),
            errMsg = type.verify(jsonApi);

        if (errMsg) {
            throw new Error(errMsg);
        }

        return type.encode(type.create(jsonApi)).finish() as Buffer;
    }

    unmarshall(infraEventBuf: Buffer): DomainEvent {
        const jsonApi = this.protobufMapping.fromBuffer(infraEventBuf) as JsonApi,
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
