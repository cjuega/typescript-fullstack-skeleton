import type DomainEvent from '@src/domain/eventBus/domainEvent';

export interface DomainEventUnmarshaller {
    unmarshall(infraEvent: unknown): DomainEvent;
}
