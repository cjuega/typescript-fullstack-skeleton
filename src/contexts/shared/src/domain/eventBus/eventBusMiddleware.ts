import type DomainEvent from '@src/domain/eventBus/domainEvent';

export interface EventBusMiddleware {
    run(events: DomainEvent[]): Promise<DomainEvent[]>;
}
