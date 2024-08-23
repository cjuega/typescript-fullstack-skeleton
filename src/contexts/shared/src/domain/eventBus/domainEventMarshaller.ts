import type DomainEvent from '@src/domain/eventBus/domainEvent';

export interface DomainEventMarshaller {
    marshall(event: DomainEvent): unknown;
}
