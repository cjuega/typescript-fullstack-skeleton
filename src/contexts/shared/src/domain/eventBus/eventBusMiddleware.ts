import DomainEvent from '@src/domain/eventBus/domainEvent';

export interface EventBusMiddleware {
    run(events: Array<DomainEvent>): Promise<Array<DomainEvent>>;
}
