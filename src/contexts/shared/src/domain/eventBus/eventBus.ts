import type DomainEvent from '@src/domain/eventBus/domainEvent';

export interface EventBus {
    publish(events: DomainEvent[]): Promise<void>;
}
