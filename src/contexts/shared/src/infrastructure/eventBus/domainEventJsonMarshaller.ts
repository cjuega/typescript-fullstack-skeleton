import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import { Marshaller } from '@src/domain/eventBus/marshaller';

export type JsonApi = {
    data: {
        id: string;
        type: string;
        occurredOn: string;
        attributes: Record<string, unknown>;
        meta: Record<string, unknown>;
    };
};

export default class DomainEventJsonMarshaller implements Marshaller {
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
}
