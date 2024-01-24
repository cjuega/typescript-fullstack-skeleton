import DomainEvent from '@src/domain/eventBus/domainEvent';

export interface DomainEventRepository {
    save(events: DomainEvent | DomainEvent[]): Promise<void>;
}
