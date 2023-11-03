import { DomainEvent, DomainEventClass } from '@src/domain/eventBus/domainEvent';

export interface DomainEventSubscriber<T extends DomainEvent> {
    subscribedTo(): Array<DomainEventClass>;

    on(domainEvent: T): Promise<void>;
}
