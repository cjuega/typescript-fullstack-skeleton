import DomainEvent from '@src/domain/eventBus/domainEvent';
import { DomainEventName } from '@src/domain/eventBus/domainEventName';

export interface DomainEventSubscriber<T extends DomainEvent> {
    subscribedTo(): Array<DomainEventName<T>>;

    on(domainEvent: T): Promise<void>;
}
