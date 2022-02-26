import { DomainEvent } from '@src/domain/eventBus/domainEvent';
import DomainEventMapping from '@src/infrastructure/eventBus/domainEventMapping';

export default class DomainEventJsonDeserializer {
    private mapping: DomainEventMapping;

    constructor(mapping: DomainEventMapping) {
        this.mapping = mapping;
    }

    deserialize(event: string): DomainEvent {
        const eventData = JSON.parse(event).data,
            eventName = eventData.type,
            eventClass = this.mapping.for(eventName);

        if (!eventClass) {
            throw new Error(`The event ${eventName} doesn't exist or has no subscribers`);
        }

        return eventClass.fromPrimitives(eventData.attributes.id, eventData.attributes, eventData.id, new Date(eventData.occurredOn));
    }
}
