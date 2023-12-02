import DomainEvent from '@src/domain/eventBus/domainEvent';

export interface DomainEventDeduplicator {
    deduplicate(domainEvents: DomainEvent[]): Promise<DomainEvent[]>;

    purge(domainEvent: DomainEvent): Promise<void>;
}
