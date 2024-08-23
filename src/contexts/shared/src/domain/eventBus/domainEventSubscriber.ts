import type DomainEvent from '@src/domain/eventBus/domainEvent';
import type { DomainEventName } from '@src/domain/eventBus/domainEventName';

export interface DomainEventSubscriber<T extends DomainEvent> {
    name(): string;

    subscribedTo(): DomainEventName<T>[];

    on(domainEvent: T): Promise<void>;
}
